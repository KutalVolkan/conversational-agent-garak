from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from backend.agent import GarakAgent

app = FastAPI(title="Garak GPT-4o Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your frontend's domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent (maintains state and conversation history).
agent = GarakAgent()

class ChatRequest(BaseModel):
    """Request model for sending a chat message."""
    message: str

class ChatResponse(BaseModel):
    """Response model including the assistant's reply and full conversation history."""
    response: str
    history: list

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(chat: ChatRequest):
    """
    Receive any chat message and process it via the unified agent logic.
    
    The agent uses the entire conversation history to decide whether to return
    a plain response or to trigger one of its functions based on context.
    
    Args:
        chat (ChatRequest): The incoming chat request containing a message string.
    
    Returns:
        ChatResponse: A response model with the assistant's reply and the complete conversation history.
    """
    try:
        response = agent.process_message(chat.message)
        return {"response": response, "history": agent.messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history():
    """
    Return the current conversation history maintained by the agent.
    
    Returns:
        dict: A dictionary containing the conversation history.
    """
    return {"history": agent.messages}

@app.post("/api/clear")
async def clear_history():
    """
    Clear the conversation history and remove any associated persistent files.
    
    Returns:
        dict: A dictionary with a status message after clearing the history.
    
    Raises:
        HTTPException: If an error occurs during the clearing process.
    """
    try:
        agent.clear_history()
        return {"status": "cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

