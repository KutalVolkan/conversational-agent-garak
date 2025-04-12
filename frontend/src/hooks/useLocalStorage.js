import { useState, useEffect } from "react";

/**
 * Custom hook for persistent localStorage state management
 * Provides synchronized access to localStorage across browser tabs
 *
 * @param {string} key - The localStorage key to store value under
 * @param {*} initialValue - The initial value if no stored value exists
 * @returns {Array} - Array containing stored value and setter function
 */
function useLocalStorage(key, initialValue) {
  // Initialize state with value from localStorage or fallback to initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Update both state and localStorage when value changes
  const setValue = (value) => {
    try {
      // Allow value to be a function for state updates based on previous value
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  // Sync state with other tabs/windows using the storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
