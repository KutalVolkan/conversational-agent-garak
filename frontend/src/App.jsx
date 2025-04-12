import React, { useState } from "react";
import { ChatProvider } from "./context/ChatContext";
import ChatInterface from "./components/chat/ChatInterface";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/TopBar";
import { AnimatePresence, motion } from "framer-motion";

/**
 * App - Main application component
 * Handles layout, responsive sidebar, and chat interface
 */
function App() {
  // State for managing mobile sidebar visibility
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toggle sidebar visibility on mobile
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Close sidebar on mobile
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <ChatProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#141413]">
        {/* Mobile top navigation bar */}
        <Topbar onToggleSidebar={toggleMobileSidebar} />

        <AnimatePresence>
          {/* Overlay backdrop when mobile sidebar is open */}
          {isMobileSidebarOpen && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileSidebar}
              aria-hidden="true"
            />
          )}

          {/* Sidebar navigation component */}
          <Sidebar
            key="sidebar-component"
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={closeMobileSidebar}
          />
        </AnimatePresence>

        {/* Main content area */}
        <main className="flex-grow overflow-y-auto relative w-full transition-all duration-300 ease-in-out flex justify-center pt-16 md:pt-0">
          <div className="w-full max-w-5xl">
            <ChatInterface />
          </div>
        </main>
      </div>
    </ChatProvider>
  );
}

export default App;
