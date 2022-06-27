import { AlertColor } from '@mui/material';
import {
  useState,
  useContext,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface ContextState {
  alertMessage: { message: string; severity: AlertColor };
  setAlertMessage: Dispatch<
    SetStateAction<{ message: string; severity: AlertColor }>
  >;
  showAlertMessage: boolean;
  setShowAlertMessage: Dispatch<SetStateAction<boolean>>;
}

const AlertMessageContext = createContext({} as ContextState);

export const AlertMessageProvider = ({ children }: { children: ReactNode }) => {
  const [alertMessage, setAlertMessage] = useState({
    message: '',
    severity: 'info' as AlertColor,
  });
  const [showAlertMessage, setShowAlertMessage] = useState(false);

  return (
    <AlertMessageContext.Provider
      value={{
        alertMessage,
        setAlertMessage,
        showAlertMessage,
        setShowAlertMessage,
      }}
    >
      {children}
    </AlertMessageContext.Provider>
  );
};

export const useAlertMessage = () => useContext(AlertMessageContext);
