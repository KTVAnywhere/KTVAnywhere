import {
  useState,
  useContext,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface ContextState {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SongDialogContext = createContext({} as ContextState);

export const SongDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <SongDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </SongDialogContext.Provider>
  );
};

export const useSongDialog = () => useContext(SongDialogContext);
