import {
  useState,
  useContext,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { PitchShifter } from 'soundtouchjs';
import { SongProps } from '../Song';

interface ContextState {
  duration: number;
  setDuration: Dispatch<SetStateAction<number>>;
  songEnded: boolean;
  setSongEnded: Dispatch<SetStateAction<boolean>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  isPlayingVocals: boolean;
  setIsPlayingVocals: Dispatch<SetStateAction<boolean>>;
  skipToTime: number | null;
  setSkipToTime: Dispatch<SetStateAction<number | null>>;
  volume: number;
  setVolume: Dispatch<SetStateAction<number>>;
  pitch: number;
  setPitch: Dispatch<SetStateAction<number>>;
  currentTime: number;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  currentSong: SongProps | null;
  setCurrentSong: Dispatch<SetStateAction<SongProps | null>>;
  nextSong: SongProps | null;
  setNextSong: Dispatch<SetStateAction<SongProps | null>>;
  lyricsEnabled: boolean;
  setLyricsEnabled: Dispatch<SetStateAction<boolean>>;
  audioContext: AudioContext;
  gainNode: GainNode;
  source: typeof PitchShifter | null;
  setSource: Dispatch<SetStateAction<typeof PitchShifter | null>>;
}

const AudioStatusContext = createContext({} as ContextState);

export const AudioStatusProvider = ({ children }: { children: ReactNode }) => {
  const [duration, setDuration] = useState<number>(0);
  const [songEnded, setSongEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingVocals, setIsPlayingVocals] = useState(true);
  const [skipToTime, setSkipToTime] = useState<number | null>(null);
  const [volume, setVolume] = useState<number>(70);
  const [pitch, setPitch] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSong, setCurrentSong] = useState<SongProps | null>(null);
  const [nextSong, setNextSong] = useState<SongProps | null>(null);
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(true);
  const [audioContext] = useState<AudioContext>(new AudioContext());
  const [gainNode] = useState<GainNode>(audioContext.createGain());
  const [source, setSource] = useState<typeof PitchShifter | null>();

  return (
    <AudioStatusContext.Provider
      value={{
        duration,
        setDuration,
        songEnded,
        setSongEnded,
        isPlaying,
        setIsPlaying,
        isPlayingVocals,
        setIsPlayingVocals,
        skipToTime,
        setSkipToTime,
        volume,
        setVolume,
        pitch,
        setPitch,
        currentTime,
        setCurrentTime,
        currentSong,
        setCurrentSong,
        nextSong,
        setNextSong,
        lyricsEnabled,
        setLyricsEnabled,
        audioContext,
        gainNode,
        source,
        setSource,
      }}
    >
      {children}
    </AudioStatusContext.Provider>
  );
};

export const useAudioStatus = () => useContext(AudioStatusContext);
