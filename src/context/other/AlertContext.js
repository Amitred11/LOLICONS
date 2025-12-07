import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '@components/alerts/CustomAlert';
import ToastContainer from '@components/alerts/ToastContainer'; // This import needs the files above to work

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

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const handleHideToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);


  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, showToast }}>
      {children}
      <CustomAlert
        {...alertState}
      />
      {/* This line will no longer cause an error */}
      <ToastContainer toasts={toasts} onHide={handleHideToast} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within an AlertProvider.");
  return context;
};