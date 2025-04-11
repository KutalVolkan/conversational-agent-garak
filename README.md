# Garak GPT-4o Assistant

Garak GPT-4o Assistant is a web application that provides a chat interface to a GPT-4o assistant enhanced with Garak (an LLM vulnerability scanner) tool functions. The assistant can list and describe Garak probes, run vulnerability scans on a configured model, and summarize scan results. It leverages OpenAI's function calling so that GPT-4o can autonomously use Garak's CLI tools under the hood. The backend is built with FastAPI, and the frontend is implemented with React.

---

## Features

- **Conversational Interface** – Interact with GPT-4o through an intuitive web UI.
- **Garak Integration** – GPT-4o can invoke Garak’s CLI to:
  - List available probes
  - Describe specific probes
  - Run a vulnerability scan
  - Summarize the scan results
- **Persistent History** – Conversations are stored persistently on disk.
- **Session Management** – Ability to reset chat and scan logs.
- **Context-Aware** – GPT-4o uses conversation context to guide its responses.

---

## Getting Started

### Prerequisites

- Python >= 3.10
- Node.js and npm (for the React frontend)
- OpenAI API key with access to GPT-4o
- Garak installed (`pip install garak`)
- A Garak REST configuration file (e.g. `rest_config.json`) that points to your model (for example, OpenAI GPT-4o or another local API)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/garak-gpt4o-assistant.git
cd garak-gpt4o-assistant
```

#### 2. Set Up the Backend

- **Create and Activate a Virtual Environment**

  **macOS / Linux:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

  **Windows (Command Prompt):**
  ```cmd
  python -m venv .venv
  .venv\Scripts\activate
  ```

  **Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```

- **Install Python Dependencies**

  ```bash
  cd backend
  pip install -r requirements.txt
  ```

- **Configure Your API Key**

  Create a `.env` file in the backend directory and add your OpenAI key:

  ```env
  OPENAI_API_KEY=sk-...
  ```

- **Configure Garak**

  Ensure your Garak REST configuration file (`rest_config.json`) is placed in the `backend/rest_target/` directory.

#### 3. Set Up the Frontend

- Navigate to the frontend directory and install dependencies:

  ```bash
  cd ../frontend
  npm install
  ```

---

## Running the Application

### Start the Backend

From the project root, run:

```bash
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

This will start the FastAPI backend server at **http://127.0.0.1:8000**.

### Start the Frontend

From the `frontend` directory, run:

```bash
npm start
```

Access the application in your browser at the URL provided by your React development server (typically [http://localhost:3000](http://localhost:3000)).

---

### Manually Test the Backend via Swagger UI

FastAPI automatically generates interactive API documentation using **Swagger UI**.

To test the API manually without the frontend:

1. Start the backend server as described above.
2. Open your browser and go to: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
3. You'll see a list of available API routes under **Garak GPT-4o Assistant API**.
4. Click on the `POST /api/chat` endpoint.
5. Click **"Try it out"**, and enter a sample request body:

```json
{
  "message": "Hello, assistant!"
}
```

6. Click **"Execute"**. The server will respond with a chat reply and current conversation history.
7. You can also test:
   - `GET /api/history` – Returns full conversation history
   - `POST /api/clear` – Clears current conversation state and related files

This is the easiest way to test and debug your backend functionality independently.

---

## Example Use Cases

You can interact with the assistant via the chat interface by typing commands such as:

- "What probes are available?"
- "Describe the lmrc.Profanity probe."
- "Run a scan using promptinject and goodside probes."
- "Summarize the last scan."

The assistant will respond based on the conversation context and determine when to invoke Garak tool functions.

---

## Project Structure

```
garak-gpt4o-assistant/
├── backend/
│   ├── __init__.py                   # Marks backend as a Python package.
│   ├── app.py                        # FastAPI server entry point.
│   ├── agent.py                      # GPT-4o assistant logic (function calling, persistence).
│   ├── config.py                     # Central configuration module (paths and settings).
│   ├── garak_tools.py                # CLI integration for Garak tool functions.
│   ├── rest_target/
│   │   └── rest_config.json          # Garak REST configuration.
│   ├── data/
│   │   └── conversation_history.json # Stored chat history.
│   ├── logs/                         # Log files (runtime or scan logs).
│   └── reports/                      # Garak scan reports.
├── frontend/
│   ├── public/                       # Public assets.
│   ├── src/
│   │   ├── components/               # Reusable components.
│   │   └── App.jsx                   # Main application component.
│   └── package.json                  # Frontend dependencies and scripts.
├── .env                              # Backend environment variables.
├── .env.example                      # Example environment file.
├── .gitignore                        # Git ignore file.
├── requirements.txt                  # Backend Python dependencies.
└── README.md                         # Project overview
```

---

## Session Management

To reset your conversation history and clear scan logs, use the "Clear History" functionality provided by the application or call the `/api/clear` endpoint.

---

## Security

- Only pre-defined tool functions are callable via function calling.
- All subprocess access to Garak is controlled.
- Conversation data is stored locally for persistence only.

---

## License

Apache license v2

---

## Acknowledgments

- [NVIDIA Garak](https://github.com/NVIDIA/garak) – LLM red teaming and robustness scanner.
- [OpenAI](https://platform.openai.com/docs/guides/gpt) – GPT-4o assistant.
- [FastAPI](https://fastapi.tiangolo.com) – Modern, fast Python web framework.
- [React](https://reactjs.org) – JavaScript library for building user interfaces.
