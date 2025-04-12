import React, { useState } from "react";
import { User, Cpu, Copy, Check } from "lucide-react";
import { formatMessageContent } from "../../utils/helpers";

/**
 * ChatMessage component - Displays a single message in the chat interface
 * Handles different styling for user and assistant messages
 */
function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const [copySuccess, setCopySuccess] = useState({});
  const [messageCopied, setMessageCopied] = useState(false);

  const copyFullMessage = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content).then(() => {
        setMessageCopied(true);
        setTimeout(() => setMessageCopied(false), 2000);
      });
    }
  };

  return (
    <div className="flex w-full overflow-x-hidden">
      <div
        className={`w-full rounded-lg px-3 sm:px-4 pt-2 overflow-hidden ${
          isUser ? "bg-[#0e0e0d] rounded-xl text-gray-300" : "text-gray-300"
        }`}
      >
        <div className="flex items-center mb-2 justify-between">
          <div className="flex items-center">
            {isUser ? (
              <User
                size={24}
                className="text-black bg-red-800 rounded-full p-0.5"
              />
            ) : (
              <>
                <Cpu size={16} className="text-gray-400 mr-2" />
                <span className="font-medium text-lg text-gray-300">Garak</span>
              </>
            )}
          </div>

          {/* Kopier-Button nur für Assistenten-Nachrichten */}
          {!isUser && (
            <button
              className="text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
              onClick={copyFullMessage}
              aria-label="Copy full message"
            >
              {messageCopied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span className="text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          )}
        </div>
        <div className="mt-1 text-base sm:text-lg break-words overflow-x-hidden">
          {formatMessageContent(message.content, copySuccess, setCopySuccess)}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
