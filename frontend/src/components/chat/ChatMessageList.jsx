import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "./ChatMessage";
import Loader from "../common/Loader";

function ChatMessageList({ messages, isLoading, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 bg-[#141413] hide-scrollbar">
      <AnimatePresence>
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 mt-4 sm:mt-8 p-4 sm:p-8"
          >
            {/* ... deine leere-State-Anzeige ... */}
            <p className="text-base sm:text-lg">
              Start a conversation with the Garak Assistant
            </p>
          </motion.div>
        ) : (
          messages.map((msg, index) => (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChatMessage message={msg} />
            </motion.div>
          ))
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start px-2 py-4"
          >
            <div className="flex items-center">
              <Loader size={16} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}

// React.memo verhindert unnötiges Neurendern, wenn sich props (messages/isLoading) nicht ändern
export default memo(ChatMessageList);
