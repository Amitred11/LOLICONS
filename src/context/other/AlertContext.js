// context/AlertContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '@components/alerts/CustomAlert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    btnText: 'Okay',
    secondaryBtnText: null, // New
    onClose: () => {},
    onSecondaryPress: () => {}, // New
  });

  const showAlert = useCallback(({ 
    title, 
    message, 
    type = 'info', 
    btnText = 'Got it', 
    onClose,
    secondaryBtnText = null, // Optional cancel button
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

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        {...alertState} // Spread all props including new ones
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within an AlertProvider.");
  return context;
};