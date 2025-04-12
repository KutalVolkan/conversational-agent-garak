import React from "react";
import PropTypes from "prop-types";
import { Menu } from "lucide-react";

/**
 * Topbar component - Mobile navigation header
 * Displays the app title and provides sidebar toggle functionality
 */
const Topbar = ({ onToggleSidebar }) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 bg-[#141413] text-gray-100 border-b border-gray-800">
      {/* Sidebar toggle button - only visible on mobile */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Application title */}
      <div className="font-semibold text-lg">Vulrak</div>

      {/* Empty spacer to balance the layout */}
      <div className="w-10"></div>
    </header>
  );
};

// Type validation for component props
Topbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
};

export default Topbar;
