import React, { useEffect, useState, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

/**
 * ChatInterface component - Main chat interface container
 * Manages message display, scrolling behavior, and message submission
 */
function ChatInterface() {
  const { messages, isLoading, sendMessage } = useChat();
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size and update on window resize
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 640);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter out system messages and function calls for display
  const displayMessages = messages.filter(
    (msg) => msg.role !== "system" && msg.role !== "function" && msg.content
  );

  // Handler for sending new messages
  function handleSendMessage(text) {
    sendMessage(text);
  }

  return (
    <div className="flex flex-col h-full bg-[#141413] text-gray-100">
      {/* Message display area with auto-scroll functionality */}
      <ChatMessageList
        messages={displayMessages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      {/* Message input area */}
      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading}
        isMobile={isMobile}
      />
    </div>
  );
}

export default ChatInterface;
