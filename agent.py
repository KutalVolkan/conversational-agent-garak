import os
import json
import openai
import logging
from typing import List, Dict, Any
import garak_tools

# Configure logging (DEBUG level for detailed output)
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s:%(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

class GarakAgent:
    """
    Agent managing the conversation with GPT-4o and the Garak tool functions.
    It handles message history, OpenAI API calls with function calling, and state persistence.
    """
    def __init__(self, history_file: str = "conversation_history.json"):
        """
        Initialize the GarakAgent. If a history file exists, load it to restore context;
        otherwise, start a new conversation using a system prompt.
        
        Args:
            history_file (str): Path to the JSON file used for conversation history.
        """
        self.history_file = history_file
        system_content = (
            "You are an AI assistant integrated with Garak (an LLM vulnerability scanner). "
            "You can answer user questions and use the provided tools to list probes, describe probes, "
            "run vulnerability scans, and summarize scan results. When you use a tool, respond with its results."
        )
        self.system_message = {"role": "system", "content": system_content}
        
        # Load or initialize conversation history.
        if os.path.isfile(self.history_file):
            try:
                with open(self.history_file, "r") as f:
                    self.messages: List[Dict[str, Any]] = json.load(f)
            except json.JSONDecodeError:
                logger.warning("History file is corrupt. Starting fresh.")
                self.messages = [self.system_message]
        else:
            self.messages = [self.system_message]
        
        # Define function schemas for the Garak tools.
        self.functions = [
            {
                "name": "list_probes",
                "description": "List all available Garak vulnerability probes.",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "describe_probe",
                "description": "Get details about a specific Garak probe (what it tests and how).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "probe_name": {
                            "type": "string",
                            "description": "Full name of the probe to describe, e.g. 'lmrc.Profanity'"
                        }
                    },
                    "required": ["probe_name"]
                }
            },
            {
                "name": "run_scan",
                "description": "Run a Garak scan on the configured model. Optionally specify a list of probes.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "probes": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of probe names to use (full identifiers). If omitted, all default probes will run."
                        }
                    }
                }
            },
            {
                "name": "summarize_last_scan",
                "description": "Summarize the results of the most recent Garak scan (indicating which probes failed or passed).",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        ]
        
        # Set the OpenAI API key.
        openai.api_key = os.getenv("OPENAI_API_KEY")
        if not openai.api_key:
            logger.error("OPENAI_API_KEY not set in environment.")

    def save_history(self):
        """Persist the conversation history to a JSON file."""
        try:
            with open(self.history_file, "w") as f:
                json.dump(self.messages, f, indent=2)
        except Exception as e:
            logger.warning("Could not save conversation history: %s", e)

    def clear_history(self):
        """Reset conversation history and remove any leftover scan files."""
        self.messages = [self.system_message]
        for file in [self.history_file, "last_scan_output.log", "last_scan.report.jsonl"]:
            if os.path.isfile(file):
                try:
                    os.remove(file)
                except OSError:
                    pass

    def process_message(self, user_input: str) -> str:
        """
        Process a new user message by sending it (with prior context) to GPT-4o.
        If the model requests a function call, execute the corresponding tool from garak_tools,
        then call the API again to incorporate the tool's output into the final response.
        
        Args:
            user_input (str): The user's new message.
        
        Returns:
            str: The final textual response from the assistant.
        """
        # Append the new user message.
        user_msg = {"role": "user", "content": user_input}
        self.messages.append(user_msg)
        try:
            response = openai.chat.completions.create(
                model="gpt-4o",  # Make sure your account supports GPT-4o function calling.
                messages=self.messages,
                functions=self.functions,
                function_call="auto",
                max_tokens=2000,
            )
        except Exception as e:
            error_text = f"Sorry, I couldn't process your request due to an API error: {e}"
            logger.error(error_text)
            self.messages.append({"role": "assistant", "content": error_text})
            self.save_history()
            return error_text

        # Capture the entire message object (not just its content).
        first_msg = response.choices[0].message
        # Safely check for a function call using getattr().
        if getattr(first_msg, "function_call", None):
            func_call = first_msg.function_call  # This should be a FunctionCall object.
            func_name = func_call.name
            func_args = func_call.arguments or {}
            logger.debug("Assistant requested function call: %s with args: %s", func_name, func_args)
            self.messages.append({
                "role": "assistant",
                "function_call": {"name": func_name, "arguments": func_args}
            })
            # If the arguments are a JSON string, parse them.
            if isinstance(func_args, str):
                try:
                    func_args = json.loads(func_args)
                except json.JSONDecodeError:
                    logger.warning("Failed to decode function arguments; using empty dict.")
                    func_args = {}
            # Execute the corresponding local function from garak_tools.
            try:
                if func_name == "list_probes":
                    func_result = garak_tools.list_probes()
                elif func_name == "describe_probe":
                    probe_name = func_args.get("probe_name", "")
                    func_result = garak_tools.describe_feature(probe_name)
                elif func_name == "run_scan":
                    probes_list = func_args.get("probes")
                    func_result = garak_tools.scan_model_rest(probes=probes_list)
                elif func_name == "summarize_last_scan":
                    func_result = garak_tools.summarize_report()
                else:
                    func_result = f"Error: Function '{func_name}' is not implemented."
            except Exception as e:
                func_result = f"Error during '{func_name}': {e}"
                logger.exception("Error executing function: %s", func_name)
            
            # Convert non-string results to JSON string.
            if not isinstance(func_result, str):
                func_result = json.dumps(func_result)

            # Append the tool function result.
            self.messages.append({
                "role": "function",
                "name": func_name,
                "content": func_result
            })
            try:
                second_response = openai.chat.completions.create(
                    model="gpt-4o",
                    messages=self.messages,
                    functions=self.functions,
                    function_call="none",
                    max_tokens=2000,
                )
            except Exception as e:
                error_text = f"Error after using tool: {e}"
                logger.error(error_text)
                self.messages.append({"role": "assistant", "content": error_text})
                self.save_history()
                return error_text

            final_msg = second_response.choices[0].message
            answer_content = final_msg.content if hasattr(final_msg, "content") else ""
            if getattr(final_msg, "function_call", None):
                # Unexpected additional function call, restart processing
                logger.warning("Unexpected additional function call in final message; restarting process.")
                return self.process_message("")
            self.messages.append({"role": "assistant", "content": answer_content})
            self.save_history()
            return answer_content
        else:
            # No function call; simply return the assistant's direct response.
            answer_content = first_msg.content if hasattr(first_msg, "content") else ""
            if answer_content:
                self.messages.append({"role": "assistant", "content": answer_content})
            else:
                answer_content = "(No content)"
                self.messages.append({"role": "assistant", "content": answer_content})
            self.save_history()
            return answer_content

# Example usage:
if __name__ == "__main__":
    agent = GarakAgent()
    # For debugging, use a sample message.
    user_prompt = "list me all probes"
    print("User prompt:", user_prompt)
    response = agent.process_message(user_prompt)
    print("Assistant response:", response)
