import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import { apiService } from "../services/api";
import useLocalStorage from "../hooks/useLocalStorage";

/**
 * Initial state for the chat context
 */
const initialState = {
  messages: [],
  isLoading: false,
  error: null,
};

/**
 * Action types for the reducer
 */
const ACTIONS = {
  SET_MESSAGES: "SET_MESSAGES",
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_HISTORY: "CLEAR_HISTORY",
};

/**
 * Reducer function to handle state updates based on dispatched actions
 */
function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };
    case ACTIONS.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.CLEAR_HISTORY:
      return { ...initialState };
    default:
      return state;
  }
}

// Create Context
const ChatContext = createContext();

/**
 * ChatProvider component - Manages chat state and API interactions
 * Provides context values to child components
 */
export function ChatProvider({ children }) {
  const [savedMessages, setSavedMessages] = useLocalStorage("chat-history", []);
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    messages: savedMessages,
  });

  // Load conversation history from backend on initial mount
  useEffect(() => {
    const loadHistoryFromBackend = async () => {
      try {
        const { history } = await apiService.getHistory();
        // Filter out system messages for UI display
        const displayMessages = history.filter((msg) => msg.role !== "system");
        dispatch({ type: ACTIONS.SET_MESSAGES, payload: displayMessages });
      } catch (error) {
        console.error("Failed to load history from backend:", error);
        // Fall back to local storage if backend fails
        if (savedMessages.length > 0) {
          dispatch({ type: ACTIONS.SET_MESSAGES, payload: savedMessages });
        }
      }
    };

    loadHistoryFromBackend();
  }, []);

  /**
   * Send a new message to the backend and process the response
   */
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    // Add user message to state
    const userMessage = { role: "user", content };
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: userMessage });

    // Set loading state
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      // Process message with the backend
      const { response, history } = await apiService.sendMessage(content);

      // Add assistant response to state
      const assistantMessage = { role: "assistant", content: response };
      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: assistantMessage });

      // Update localStorage with the latest messages (excluding system message)
      const displayMessages = history.filter((msg) => msg.role !== "system");
      setSavedMessages(displayMessages);
    } catch (error) {
      console.error("Error processing message:", error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });

      // Add error message to chat
      const errorMessage = {
        role: "assistant",
        content: `Error: ${
          error.message || "Failed to communicate with the server."
        }`,
      };
      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: errorMessage });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Clear the chat history both in UI and backend
   */
  const clearHistory = async () => {
    try {
      await apiService.clearHistory();
      dispatch({ type: ACTIONS.CLEAR_HISTORY });
      setSavedMessages([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      messages: state.messages,
      isLoading: state.isLoading,
      error: state.error,
      sendMessage,
      clearHistory,
    }),
    [state.messages, state.isLoading, state.error, sendMessage, clearHistory]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Custom hook to access the chat context
 * Ensures the hook is used within a ChatProvider
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
