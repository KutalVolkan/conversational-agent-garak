/**
 * Base URL for all API endpoints
 */
const API_BASE_URL = "http://localhost:8000/api";

/**
 * Service class for API communication with the backend
 * Handles chat messages, history management, and error handling
 */
class ApiService {
  /**
   * Send a chat message to the backend
   * @param {string} message - The user message
   * @returns {Promise<Object>} - Response containing assistant reply and history
   */
  async sendMessage(message) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Unknown error occurred");
      }

      return await response.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }

  /**
   * Get the current conversation history
   * @returns {Promise<Object>} - Response containing conversation history
   */
  async getHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch history");
      }

      return await response.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }

  /**
   * Clear the conversation history
   * @returns {Promise<Object>} - Response indicating success
   */
  async clearHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to clear history");
      }

      return await response.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }
}

// Create a singleton instance for global use
export const apiService = new ApiService();
