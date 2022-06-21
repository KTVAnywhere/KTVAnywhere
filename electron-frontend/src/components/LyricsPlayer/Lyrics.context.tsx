import { Lrc, Runner } from 'lrc-kit';
import {
  useState,
  useContext,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface ContextState {
  lyricsRunner: Runner;
  setLyricsRunner: Dispatch<SetStateAction<Runner>>;
}

const LyricsContext = createContext({} as ContextState);

export const LyricsProvider = ({ children }: { children: ReactNode }) => {
  const [lyricsRunner, setLyricsRunner] = useState(
    new Runner(Lrc.parse(''), true)
  );

  return (
    <LyricsContext.Provider
      value={{
        lyricsRunner,
        setLyricsRunner,
      }}
    >
      {children}
    </LyricsContext.Provider>
  );
};

export const useLyrics = () => useContext(LyricsContext);
