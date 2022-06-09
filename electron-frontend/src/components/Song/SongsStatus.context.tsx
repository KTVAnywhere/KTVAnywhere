import {
  useState,
  useContext,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface ContextState {
  songsStatus: string[];
  setSongsStatus: Dispatch<SetStateAction<string[]>>;
}

const SongsStatusContext = createContext({} as ContextState);

export const SongsStatusProvider = ({ children }: { children: ReactNode }) => {
  const [songsStatus, setSongsStatus] = useState([] as string[]);
  return (
    <SongsStatusContext.Provider value={{ songsStatus, setSongsStatus }}>
      {children}
    </SongsStatusContext.Provider>
  );
};

export const useSongsStatus = () => useContext(SongsStatusContext);
