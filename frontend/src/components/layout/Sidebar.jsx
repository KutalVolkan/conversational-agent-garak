import React, { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RefreshCw, X } from "lucide-react";
import { useChat } from "../../context/ChatContext";

/**
 * Navigation items displayed at the top of the sidebar
 */
const topMenuItems = [
  {
    name: "Reset Chat",
    icon: RefreshCw,
    href: "#",
    isAction: true,
  },
];

/**
 * Navigation items displayed at the bottom of the sidebar
 */
const bottomMenuItems = [];

/**
 * Individual sidebar navigation item component
 * Handles both links and action buttons with animations
 */
const SidebarItem = ({ item, isCollapsed, onAction }) => {
  const { name, icon: Icon, href, isAction } = item;

  // Animation variants for text appearance/disappearance
  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 },
  };

  // Handle click events for action items
  const handleClick = (e) => {
    if (isAction && onAction) {
      e.preventDefault();
      onAction(name);
    }
  };

  return (
    <a
      href={href}
      className="flex items-center px-3 py-2.5 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 group h-11"
      title={isCollapsed ? name : undefined}
      onClick={handleClick}
    >
      <Icon size={20} className="flex-shrink-0" />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            variants={itemVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={{ duration: 0.2, delay: 0.1 }}
            className="ml-3 whitespace-nowrap overflow-hidden"
          >
            {name}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
};

SidebarItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    href: PropTypes.string.isRequired,
    isAction: PropTypes.bool,
  }).isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onAction: PropTypes.func,
};

/**
 * Main sidebar component with responsive behavior
 * Handles both mobile and desktop layouts with animations
 */
const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  // State for desktop sidebar collapse toggle
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { clearHistory } = useChat();

  // Check if currently on mobile viewport
  const isCurrentlyMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  // Toggle desktop sidebar expanded/collapsed state
  const toggleDesktopSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Animation variants for sidebar layout changes
  const sidebarVariants = {
    expanded: { width: "250px" },
    collapsed: { width: "76px" },
    mobileHidden: { x: "-100%" },
    mobileVisible: { x: 0 },
  };

  // Animation for the toggle chevron icon
  const toggleIconVariants = {
    initial: { rotate: 0 },
    animate: { rotate: isCollapsed ? 180 : 0 },
    transition: { duration: 0.3 },
  };

  // Handle sidebar action items
  const handleAction = (actionName) => {
    if (actionName === "Reset Chat") {
      if (
        window.confirm(
          "Are you sure you want to clear the conversation history?"
        )
      ) {
        clearHistory();
        if (isCurrentlyMobile) onCloseMobile();
      }
    }
  };

  // Handle sidebar toggle button based on device context
  const handleToggleButtonClick = () => {
    if (isCurrentlyMobile) {
      onCloseMobile();
    } else {
      toggleDesktopSidebar();
    }
  };

  return (
    <motion.div
      key="sidebar"
      variants={sidebarVariants}
      initial={isCurrentlyMobile ? "mobileHidden" : "expanded"}
      animate={
        isCurrentlyMobile
          ? isMobileOpen
            ? "mobileVisible"
            : "mobileHidden"
          : isCollapsed
          ? "collapsed"
          : "expanded"
      }
      exit={isCurrentlyMobile ? "mobileHidden" : undefined}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`
        flex flex-col bg-[#141413] text-gray-100 shadow-lg border-r border-gray-800
        ${
          isCurrentlyMobile
            ? `fixed top-0 left-0 h-screen z-50 ${
                isMobileOpen ? "block" : "hidden"
              }`
            : `relative h-screen hidden md:flex`
        }
      `}
      style={{ overflow: "hidden" }}
    >
      {/* Sidebar header with title and toggle button */}
      <div className="px-4 py-3 flex flex-col border-b border-gray-700">
        <div
          className={`flex items-center ${
            isCollapsed && !isCurrentlyMobile
              ? "justify-center"
              : "justify-between"
          } h-10`}
        >
          {!isCollapsed && !isCurrentlyMobile && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="font-semibold text-xl whitespace-nowrap"
            >
              Vulrak
            </motion.span>
          )}
          <button
            onClick={handleToggleButtonClick}
            className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white"
            aria-label={
              isCurrentlyMobile
                ? "Close sidebar"
                : isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            <motion.div
              key={isCollapsed ? "right" : "left"}
              variants={toggleIconVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3 }}
            >
              {isCurrentlyMobile ? <X size={20} /> : <ChevronLeft size={20} />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Sidebar content with navigation items */}
      <div className="flex flex-col flex-grow p-4 pt-0 overflow-y-auto">
        {/* Top navigation items */}
        <nav className="flex flex-col space-y-2 mb-auto mt-4">
          {topMenuItems.map((item) => (
            <SidebarItem
              key={item.name}
              item={item}
              isCollapsed={isCollapsed && !isCurrentlyMobile}
              onAction={handleAction}
            />
          ))}
        </nav>
        {/* Bottom navigation items */}
        <nav className="flex flex-col space-y-2">
          {bottomMenuItems.map((item) => (
            <SidebarItem
              key={item.name}
              item={item}
              isCollapsed={isCollapsed && !isCurrentlyMobile}
              onAction={handleAction}
            />
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

Sidebar.propTypes = {
  isMobileOpen: PropTypes.bool.isRequired,
  onCloseMobile: PropTypes.func.isRequired,
};

export default Sidebar;
