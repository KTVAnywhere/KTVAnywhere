import {
  useState,
  useContext,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { PitchShifter } from 'soundtouchjs';
import { SongProps } from './Song';

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
  tempo: number;
  setTempo: Dispatch<SetStateAction<number>>;
  currentTime: number;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  currentSong: SongProps | null;
  setCurrentSong: Dispatch<SetStateAction<SongProps | null>>;
  nextSong: SongProps | null;
  setNextSong: Dispatch<SetStateAction<SongProps | null>>;
  lyricsEnabled: boolean;
  setLyricsEnabled: Dispatch<SetStateAction<boolean>>;
  graphEnabled: boolean;
  setGraphEnabled: Dispatch<SetStateAction<boolean>>;
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
  reverb1Enabled: boolean;
  setReverb1Enabled: Dispatch<SetStateAction<boolean>>;
  reverb2Enabled: boolean;
  setReverb2Enabled: Dispatch<SetStateAction<boolean>>;
  reverb1Media: MediaStreamAudioSourceNode | null | undefined;
  setReverb1Media: Dispatch<
    SetStateAction<MediaStreamAudioSourceNode | null | undefined>
  >;
  reverb2Media: MediaStreamAudioSourceNode | null | undefined;
  setReverb2Media: Dispatch<
    SetStateAction<MediaStreamAudioSourceNode | null | undefined>
  >;
  reverb1Node: ConvolverNode | undefined;
  setReverb1Node: Dispatch<SetStateAction<ConvolverNode | undefined>>;
  reverb2Node: ConvolverNode | undefined;
  setReverb2Node: Dispatch<SetStateAction<ConvolverNode | undefined>>;
  reverb1GainNode: GainNode;
  reverb2GainNode: GainNode;
  reverb1Volume: number;
  setReverb1Volume: Dispatch<SetStateAction<number>>;
  reverb2Volume: number;
  setReverb2Volume: Dispatch<SetStateAction<number>>;
}

const AudioStatusContext = createContext({} as ContextState);

export const AudioStatusProvider = ({ children }: { children: ReactNode }) => {
  const audioStatusConfig = window.electron.store.config.getAudioStatusConfig();
  const song =
    audioStatusConfig.songId === ''
      ? null
      : window.electron.store.songs.getSong(audioStatusConfig.songId);
  const timePlayed =
    audioStatusConfig.songId === '' ? 0 : audioStatusConfig.currentTime;
  const songDuration =
    audioStatusConfig.songId === '' ? 0 : audioStatusConfig.duration;
  const newAudioContext = new AudioContext();

  const newGainNode = newAudioContext.createGain();
  const newMicrophone1GainNode = newAudioContext.createGain();
  const newMicrophone2GainNode = newAudioContext.createGain();
  const newReverb1GainNode = newAudioContext.createGain();
  const newReverb2GainNode = newAudioContext.createGain();
  newGainNode.gain.value = audioStatusConfig.volume / 100;
  newMicrophone1GainNode.gain.value = audioStatusConfig.microphone1Volume / 100;
  newMicrophone2GainNode.gain.value = audioStatusConfig.microphone2Volume / 100;
  newReverb1GainNode.gain.value = audioStatusConfig.reverb1Volume / 100;
  newReverb2GainNode.gain.value = audioStatusConfig.reverb2Volume / 100;

  const [duration, setDuration] = useState<number>(songDuration);
  const [songEnded, setSongEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingVocals, setIsPlayingVocals] = useState(
    audioStatusConfig.vocalsEnabled
  );
  const [volume, setVolume] = useState<number>(audioStatusConfig.volume);
  const [pitch, setPitch] = useState<number>(audioStatusConfig.pitch);
  const [tempo, setTempo] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(timePlayed);
  const [currentSong, setCurrentSong] = useState<SongProps | null>(song);
  const [nextSong, setNextSong] = useState<SongProps | null>(null);
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(
    audioStatusConfig.lyricsEnabled
  );
  const [graphEnabled, setGraphEnabled] = useState<boolean>(
    audioStatusConfig.graphEnabled
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
  const [audioInput1Id, setAudioInput1Id] = useState<string>(
    audioStatusConfig.audioInput1Id
  );
  const [audioInput2Id, setAudioInput2Id] = useState<string>(
    audioStatusConfig.audioInput2Id
  );
  const [microphone1GainNode] = useState<GainNode>(newMicrophone1GainNode);
  const [microphone2GainNode] = useState<GainNode>(newMicrophone2GainNode);
  const [microphone1Volume, setMicrophone1Volume] = useState<number>(
    audioStatusConfig.microphone1Volume
  );
  const [microphone2Volume, setMicrophone2Volume] = useState<number>(
    audioStatusConfig.microphone2Volume
  );
  const [reverb1Enabled, setReverb1Enabled] = useState<boolean>(false);
  const [reverb2Enabled, setReverb2Enabled] = useState<boolean>(false);
  const [reverb1Media, setReverb1Media] =
    useState<MediaStreamAudioSourceNode | null>();
  const [reverb2Media, setReverb2Media] =
    useState<MediaStreamAudioSourceNode | null>();
  const [reverb1Node, setReverb1Node] = useState<ConvolverNode>();
  const [reverb2Node, setReverb2Node] = useState<ConvolverNode>();
  const [reverb1GainNode] = useState<GainNode>(newReverb1GainNode);
  const [reverb2GainNode] = useState<GainNode>(newReverb2GainNode);
  const [reverb1Volume, setReverb1Volume] = useState<number>(
    audioStatusConfig.reverb1Volume
  );
  const [reverb2Volume, setReverb2Volume] = useState<number>(
    audioStatusConfig.reverb2Volume
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
        tempo,
        setTempo,
        currentTime,
        setCurrentTime,
        currentSong,
        setCurrentSong,
        nextSong,
        setNextSong,
        lyricsEnabled,
        setLyricsEnabled,
        graphEnabled,
        setGraphEnabled,
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
        reverb1Enabled,
        setReverb1Enabled,
        reverb2Enabled,
        setReverb2Enabled,
        reverb1Media,
        setReverb1Media,
        reverb2Media,
        setReverb2Media,
        reverb1Node,
        setReverb1Node,
        reverb2Node,
        setReverb2Node,
        reverb1GainNode,
        reverb2GainNode,
        reverb1Volume,
        setReverb1Volume,
        reverb2Volume,
        setReverb2Volume,
      }}
    >
      {children}
    </AudioStatusContext.Provider>
  );
};

export const useAudioStatus = () => useContext(AudioStatusContext);
