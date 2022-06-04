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

const SongStagingDialogContext = createContext({} as ContextState);

export const SongStagingDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SongStagingDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </SongStagingDialogContext.Provider>
  );
};

export const useSongStagingDialog = () => useContext(SongStagingDialogContext);
