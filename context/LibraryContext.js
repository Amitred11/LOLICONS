// Import necessary hooks from React.
import React, { createContext, useContext, useState } from 'react';

// Create the context for managing the user's library.
const LibraryContext = createContext();

// Create a custom hook for easy access to the library context.
export const useLibrary = () => useContext(LibraryContext);

/**
 * Provider component that manages the state of the user's comic library.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 */
export const LibraryProvider = ({ children }) => {
  // The state will be an array of comic IDs that are in the user's library.
  const [library, setLibrary] = useState(['1']); // Start with comic '1' in the library by default for demo purposes.

  /**
   * Adds a comic to the library if it is not already present.
   * @param {string} comicId - The ID of the comic to add.
   */
  const addToLibrary = (comicId) => {
    if (!library.includes(comicId)) {
      setLibrary(prev => [...prev, comicId]);
    }
  };

  /**
   * Removes a comic from the library.
   * @param {string} comicId - The ID of the comic to remove.
   */
  const removeFromLibrary = (comicId) => {
    setLibrary(prev => prev.filter(id => id !== comicId));
  };

  /**
   * Checks if a specific comic is in the library.
   * @param {string} comicId - The ID of the comic to check.
   * @returns {boolean} True if the comic is in the library, false otherwise.
   */
  const isInLibrary = (comicId) => {
    return library.includes(comicId);
  };

  // Bundle the state and functions into a value object for the provider.
  const value = {
    library,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};