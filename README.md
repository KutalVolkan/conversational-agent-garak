# Garak GPT-4o Assistant

This is a **Streamlit application** that provides a chat interface to a GPT-4o assistant enhanced with **Garak** (LLM vulnerability scanner) tool functions. The assistant can list and describe Garak probes, run vulnerability scans on a configured model, and summarize the results. It uses OpenAI's **function calling** to let GPT-4o autonomously use Garak's CLI under the hood.

---

## ✨ Features

- 💬 **Conversational Interface** – Chat with GPT-4o in a web UI.
- 🧪 **Garak Integration** – GPT-4o can call Garak’s CLI to:
  - list available probes
  - describe specific probes
  - run a scan
  - summarize the scan
- 💾 **Persistent History** – Conversation state is stored between sessions.
- 🧼 **Clearable Session** – Reset chat + scan logs from the sidebar.
- 🧠 **Context-aware** – GPT-4o uses memory to continue discussions across steps.

---

## 🚀 Getting Started

### ✅ Prerequisites

- Python 3.9+
- OpenAI API key with access to GPT-4o
- Garak installed (`pip install garak`)
- A Garak REST config file (e.g. `rest_config.json`) that points to your model (e.g. OpenAI GPT-4o or local API)

---

### ⚙️ Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/streamlit-garak-app.git
cd streamlit-garak-app
```

#### 2. Create and activate a virtual environment

**macOS / Linux**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows (Command Prompt)**
```cmd
python -m venv .venv
.venv\Scripts\activate
```

**Windows (PowerShell)**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> If you don’t have `garak` already installed, you can also do:
> ```bash
> pip install garak
> ```

#### 4. Configure your API key

Create a `.env` file in the project root and add your OpenAI key:

```env
OPENAI_API_KEY=sk-...
```

Or set it in your terminal session before running the app.

---

### ▶️ Run the app

```bash
streamlit run app.py
```

Then open your browser to: [http://localhost:8501](http://localhost:8501)

---

## 🧠 Example Use Cases

You can simply type in the chat:

- `What probes are available?`
- `Describe the lmrc.Profanity probe.`
- `Run a scan using promptinject and goodside probes.`
- `Summarize the last scan.`

The assistant will respond, decide when to run tools, and maintain context.

---

## 📁 Project Structure

```
streamlit_garak_app/
├── app.py              # Streamlit UI + chat interface
├── agent.py            # GPT-4o assistant logic (function calling, memory)
├── garak_tools.py      # CLI integration for Garak tool functions
├── rest_config.json    # Example config (for scanning GPT-4o via REST)
├── requirements.txt
├── .env                # Your OpenAI API key (not committed)
└── README.md
```

---

## 🧹 Resetting the Session

Use the **"Clear History"** button in the sidebar to reset chat, scan logs, and memory.

---

## 🔐 Security

Only defined tools are callable by GPT-4o via function calling. All subprocess access to Garak is controlled. Conversation data is stored locally for persistence only.

---

## 📜 License

MIT

---

## 🙌 Acknowledgments

- [NVIDIA Garak](https://github.com/NVIDIA/garak) – LLM red teaming & robustness scanner
- [OpenAI](https://platform.openai.com/docs/guides/gpt) – GPT-4o assistant
- [Streamlit](https://streamlit.io) – The easiest way to build Python apps
