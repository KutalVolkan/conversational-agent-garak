import { React } from "react";
import { useChat } from "../../context/ChatContext";
import { Menu, RefreshCw, X } from "lucide-react";

export const MobileTopBar = ({ onMenuToggle, isSidebarOpen }) => {
  const { clearHistory } = useChat();

  const handleResetChat = () => {
    if (
      window.confirm("Are you sure you want to clear the conversation history?")
    ) {
      clearHistory();
    }
  };

  return (
    <div className="bg-[#141413] border-b border-gray-800 h-14 flex items-center justify-between px-4 md:hidden">
      <div className="flex items-center">
        <button
          onClick={onMenuToggle}
          className="text-gray-400 hover:text-white mr-3"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-semibold text-lg text-gray-100">My App</span>
      </div>
      <button
        onClick={handleResetChat}
        className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700"
      >
        <RefreshCw size={20} />
      </button>
    </div>
  );
};
