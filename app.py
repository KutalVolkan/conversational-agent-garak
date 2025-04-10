import streamlit as st
from agent import GarakAgent

# Set page config for a better layout in Streamlit
st.set_page_config(page_title="Garak GPT-4o Assistant", layout="wide")

# Initialize or retrieve the agent (persistent across interactions via session state)
if "agent" not in st.session_state:
    st.session_state["agent"] = GarakAgent()
agent = st.session_state["agent"]

# Sidebar content
st.sidebar.title("Garak GPT-4o Assistant")
st.sidebar.markdown("A local chat interface to GPT-4o with Garak scanning tools.")
if st.sidebar.button("Clear History"):
    agent.clear_history()
    st.success("Conversation history cleared. Start a new chat.")
    st.rerun

# Main chat interface
st.header("🤖 Chat with Garak Assistant")

# Display existing conversation messages.
# Only messages with the "content" field will be displayed.
for msg in agent.messages:
    # Skip system messages, function messages, or any that don't have content
    if msg.get("role") in ["system", "function"] or "content" not in msg:
        continue
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Input box for the user to type a new message
if prompt := st.chat_input("Type your message here..."):
    with st.chat_message("user"):
        st.markdown(prompt)
    with st.chat_message("assistant"):
        with st.spinner("Processing, please wait..."):
            response = agent.process_message(prompt)
            st.markdown(response)
