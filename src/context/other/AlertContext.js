import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '@components/alerts/CustomAlert';
import ToastContainer from '@components/alerts/ToastContainer'; 

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    btnText: 'Okay',
    secondaryBtnText: null,
    onClose: () => {},
    onSecondaryPress: () => {},
  });

  const [toasts, setToasts] = useState([]);

  // --- Alert Logic ---
  const showAlert = useCallback(({
    title,
    message,
    type = 'info',
    btnText = 'Got it',
    onClose,
    secondaryBtnText = null,
    onSecondaryPress = null
  }) => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
      btnText,
      secondaryBtnText,
      onSecondaryPress: () => {
         hideAlert();
         if (onSecondaryPress) onSecondaryPress();
      },
      onClose: () => {
          hideAlert();
          if (onClose) onClose();
      },
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  // --- Toast Logic ---
  const showToast = useCallback((arg1, arg2, arg3) => {
    const id = Date.now() + Math.random();

    let title = null;
    let message = '';
    let type = 'info';

    // Signature 1: showToast(title, message, type)
    if (arg1 && arg2 && arg3) {
      title = arg1;
      message = arg2;
      type = arg3;
    }
    // Signature 2: showToast(message, type)
    else if (arg1 && arg2) {
      message = arg1;
      type = arg2;
    }
    // Signature 3: showToast(message) - Fallback
    else {
      message = arg1 || "Unknown";
    }

    setToasts(prev => [...prev, { id, title, message, type }]);
  }, []);

  const handleHideToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, showToast }}>
      {children}
      <CustomAlert {...alertState} />
      <ToastContainer toasts={toasts} onHide={handleHideToast} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within an AlertProvider.");
  return context;
};