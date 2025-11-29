// Import necessary modules from React and modal components.
import React, { createContext, useContext, useState } from 'react';
import FilterModal from '@features/comics/common/FilterModal';
import ActionSheetModal from '@features/comics/common/ActionSheetModal';
import ChapterListModal from '@features/comics/features/reader/ChapterListModal';
import DownloadModal from '@features/comics/common/DownloadModal';
import InfoModal from '@features/profile/components/modals/InfoModal';
import QuietHoursModal from '@features/profile/components/modals/QuietHoursModal';
// Import other modals here in the future.

// Create a context for global modal management.
const ModalContext = createContext();

// Create a custom hook for easy access to modal functions.
export const useModal = () => useContext(ModalContext);

/**
 * Provider component that offers a global system for showing and hiding modals.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 */
export const ModalProvider = ({ children }) => {
  // State to manage the currently active modal.
  const [modalState, setModalState] = useState({
    type: null, // e.g., 'filter', 'chapterList', identifies which modal to show.
    props: {},  // Props to be passed to the modal component.
  });

  /**
   * Displays a modal of a specific type with given props.
   * @param {string} type - The identifier for the modal to show.
   * @param {object} [props={}] - The props to pass to the modal component.
   */
  const show = (type, props = {}) => {
    setModalState({ type, props });
  };

  /**
   * Hides the currently active modal.
   */
  const hide = () => {
    setModalState({ type: null, props: {} });
  };

  /**
   * Renders the appropriate modal component based on the current modalState.
   * This function is called within the provider's render method.
   * @returns {React.Component|null} The modal component to render or null.
   */
  const renderModal = () => {
    const { type, props } = modalState;

    // Use a switch statement to map the modal type to its component.
    switch (type) {
      case 'filter':
        return <FilterModal isVisible={true} onClose={hide} {...props} />;
      case 'actionSheet':
        return <ActionSheetModal isVisible={true} onClose={hide} {...props} />;
      case 'chapterList':
        return <ChapterListModal isVisible={true} onClose={hide} {...props} />;
      case 'download':
        return <DownloadModal isVisible={true} onClose={hide} {...props} />;
      case 'info':
        return <InfoModal isVisible={true} onClose={hide} {...props} />;
      case 'quietHours':
        return <QuietHoursModal isVisible={true} onClose={hide} {...props} />;
      // If the type doesn't match any case, render nothing.
      default:
        return null;
    }
  };

  return (
    <ModalContext.Provider value={{ show, hide }}>
      {/* Render the rest of the application */}
      {children}
      {/* Render the active modal on top of the application content */}
      {renderModal()}
    </ModalContext.Provider>
  );
};