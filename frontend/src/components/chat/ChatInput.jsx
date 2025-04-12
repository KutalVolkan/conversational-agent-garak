import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, ChevronDown, ShieldQuestion } from "lucide-react";

/**
 * ChatInput component - Provides the message input interface
 * Features auto-resizing textarea and responsive design for mobile/desktop
 */
function ChatInput({ onSend, isLoading, isMobile }) {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef(null);

  // Auto-resize textarea based on content
  const autoResizeTextarea = useCallback(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 200;
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, []);

  // Apply auto-resize when input text changes
  useEffect(() => {
    autoResizeTextarea();
  }, [inputText, autoResizeTextarea]);

  // Update input state when typing
  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  // Process form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    // Send message to parent component
    onSend(trimmed);
    setInputText("");
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.overflowY = "hidden";
    }
  };

  // Handle Enter key press for submission
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-2 sm:px-4 py-2 sm:py-4 bg-[#141413]">
      <div className="w-full bg-[#1C1C1C] border-[0.5px] border-[#383838] rounded-xl sm:rounded-2xl shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035)] hover:border-[#444444] focus-within:border-[#444444] focus-within:shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.075)] transition-all duration-200">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Message input textarea with auto-resize */}
          <div className="flex flex-col gap-2 sm:gap-3.5 mx-2.5 sm:mx-3.5 mt-2.5 sm:mt-3.5 mb-2 sm:mb-2">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows="1"
              placeholder="Ask a question or request assistance..."
              className="w-full p-0 m-0 bg-transparent border-none outline-none resize-none hide-scrollbar text-[#E1E1E1] placeholder-[#777777] text-md sm:text-md leading-snug min-h-[24px]"
              style={{ maxHeight: "200px", overflowY: "hidden" }}
              aria-label="Chat input"
            />
          </div>

          {/* Input controls row - buttons and options */}
          <div className="flex gap-1.5 sm:gap-2.5 w-full items-center px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5">
            {/* Left side - tool options - open for now because no options*/}
            <div className="relative flex-1 flex items-center gap-1.5 sm:gap-2 shrink min-w-0">
              <div className="relative shrink-0">
          
              </div>
            </div>

            {/* Model selector dropdown */}
            <div
              className={`overflow-hidden shrink-0 ${
                isMobile ? "" : "p-1 -m-1"
              }`}
            >
              <button
                className={`inline-flex items-center justify-center border-[0.5px] text-[#E1E1E1] gap-[0.175em] rounded-md border-transparent text-xs sm:text-sm opacity-80 transition hover:opacity-100 hover:bg-[#2A2A2A] hover:border-[#444444] ${
                  isMobile ? "h-6 px-1" : "h-7 px-1.5 ml-1.5"
                }`}
                type="button"
                aria-label="Select model"
              >
                <span className="font-serif whitespace-nowrap">
                  GPT-4o & Garak
                </span>
              </button>
            </div>

            {/* Send button */}
            <div>
              <button
                className={`inline-flex items-center justify-center bg-red-500 text-white rounded-md sm:rounded-lg active:scale-95 transition-opacity duration-200 ${
                  !inputText.trim() || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-opacity-90 cursor-pointer"
                } ${isMobile ? "h-7 w-7" : "h-8 w-8"}`}
                type="submit"
                aria-label="Send message"
                disabled={!inputText.trim() || isLoading}
              >
                <ArrowUp size={isMobile ? 14 : 16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatInput;
