import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '@components/CustomAlert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'construction', 'success', 'error', 'info'
    btnText: 'Okay',
    onClose: () => {},
  });

  const showAlert = useCallback(({ title, message, type = 'info', btnText = 'Got it', onClose }) => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
      btnText,
      onClose: onClose || (() => hideAlert()),
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);


  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        btnText={alertState.btnText}
        onClose={() => {
            hideAlert();
            if(alertState.onClose) alertState.onClose();
        }}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider. Please wrap your AppNavigator in <AlertProvider>.");
  }
  return context;
};