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
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isPlayingVocals: boolean;
  setIsPlayingVocals: Dispatch<SetStateAction<boolean>>;
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
  microphone1Enabled: boolean;
  setMicrophone1Enabled: Dispatch<SetStateAction<boolean>>;
  microphone2Enabled: boolean;
  setMicrophone2Enabled: Dispatch<SetStateAction<boolean>>;
  microphone1Media: MediaStreamAudioSourceNode | null | undefined;
  setMicrophone1Media: Dispatch<
    SetStateAction<MediaStreamAudioSourceNode | null | undefined>
  >;
  microphone2Media: MediaStreamAudioSourceNode | null | undefined;
  setMicrophone2Media: Dispatch<
    SetStateAction<MediaStreamAudioSourceNode | null | undefined>
  >;
  audioInput1Id: string;
  setAudioInput1Id: Dispatch<SetStateAction<string>>;
  audioInput2Id: string;
  setAudioInput2Id: Dispatch<SetStateAction<string>>;
  microphone1GainNode: GainNode;
  microphone2GainNode: GainNode;
  microphone1Volume: number;
  setMicrophone1Volume: Dispatch<SetStateAction<number>>;
  microphone2Volume: number;
  setMicrophone2Volume: Dispatch<SetStateAction<number>>;
}

const AudioStatusContext = createContext({} as ContextState);

export const AudioStatusProvider = ({ children }: { children: ReactNode }) => {
  const playingSong = window.electron.store.config.getPlayingSong();
  const song =
    playingSong.songId === ''
      ? null
      : window.electron.store.songs.getSong(playingSong.songId);
  const timePlayed = playingSong.songId === '' ? 0 : playingSong.currentTime;
  const songDuration = playingSong.songId === '' ? 0 : playingSong.duration;
  const newAudioContext = new AudioContext();
  const newGainNode = newAudioContext.createGain();
  newGainNode.gain.value = playingSong.volume / 100;
  const newMicrophone1GainNode = newAudioContext.createGain();
  newMicrophone1GainNode.gain.value = playingSong.volume / 100;
  const newMicrophone2GainNode = newAudioContext.createGain();
  newMicrophone2GainNode.gain.value = playingSong.volume / 100;
  const [duration, setDuration] = useState<number>(songDuration);
  const [songEnded, setSongEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingVocals, setIsPlayingVocals] = useState(
    playingSong.vocalsEnabled
  );
  const [volume, setVolume] = useState<number>(playingSong.volume);
  const [pitch, setPitch] = useState<number>(playingSong.pitch);
  const [currentTime, setCurrentTime] = useState<number>(timePlayed);
  const [currentSong, setCurrentSong] = useState<SongProps | null>(song);
  const [nextSong, setNextSong] = useState<SongProps | null>(null);
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(
    playingSong.lyricsEnabled
  );
  const [audioContext] = useState<AudioContext>(newAudioContext);
  const [gainNode] = useState<GainNode>(newGainNode);
  const [source, setSource] = useState<typeof PitchShifter | null>();
  const [microphone1Enabled, setMicrophone1Enabled] = useState<boolean>(false);
  const [microphone2Enabled, setMicrophone2Enabled] = useState<boolean>(false);
  const [microphone1Media, setMicrophone1Media] =
    useState<MediaStreamAudioSourceNode | null>();
  const [microphone2Media, setMicrophone2Media] =
    useState<MediaStreamAudioSourceNode | null>();
  const [audioInput1Id, setAudioInput1Id] = useState<string>('');
  const [audioInput2Id, setAudioInput2Id] = useState<string>('');
  const [microphone1GainNode] = useState<GainNode>(newMicrophone1GainNode);
  const [microphone2GainNode] = useState<GainNode>(newMicrophone2GainNode);
  const [microphone1Volume, setMicrophone1Volume] = useState<number>(
    playingSong.volume
  );
  const [microphone2Volume, setMicrophone2Volume] = useState<number>(
    playingSong.volume
  );

  return (
    <AudioStatusContext.Provider
      value={{
        duration,
        setDuration,
        songEnded,
        setSongEnded,
        isPlaying,
        setIsPlaying,
        isLoading,
        setIsLoading,
        isPlayingVocals,
        setIsPlayingVocals,
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
        microphone1Enabled,
        setMicrophone1Enabled,
        microphone2Enabled,
        setMicrophone2Enabled,
        microphone1Media,
        setMicrophone1Media,
        microphone2Media,
        setMicrophone2Media,
        audioInput1Id,
        setAudioInput1Id,
        audioInput2Id,
        setAudioInput2Id,
        microphone1GainNode,
        microphone2GainNode,
        microphone1Volume,
        setMicrophone1Volume,
        microphone2Volume,
        setMicrophone2Volume,
      }}
    >
      {children}
    </AudioStatusContext.Provider>
  );
};

export const useAudioStatus = () => useContext(AudioStatusContext);
