import {
  useState,
  useContext,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface ActionType {
  label: string;
  fn: () => void;
}

interface ContextState {
  confirmationMessage: { heading: string; message: string | JSX.Element };
  setConfirmationMessage: Dispatch<
    SetStateAction<{ heading: string; message: string | JSX.Element }>
  >;
  actions: ActionType[];
  setActions: Dispatch<SetStateAction<ActionType[]>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ConfirmationContext = createContext({} as ContextState);

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [confirmationMessage, setConfirmationMessage] = useState<{
    heading: string;
    message: string | JSX.Element;
  }>({
    heading: '',
    message: '',
  });
  const [actions, setActions] = useState([] as ActionType[]);
  const [open, setOpen] = useState(false);

  return (
    <ConfirmationContext.Provider
      value={{
        confirmationMessage,
        setConfirmationMessage,
        actions,
        setActions,
        open,
        setOpen,
      }}
    >
      {children}
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => useContext(ConfirmationContext);
