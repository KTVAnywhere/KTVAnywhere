import { AudioContext } from 'standardized-audio-context-mock';
import { queueTestDataWithSongs012, songListTestData } from './testData';

const mockedElectron = {
  ...window.electron,
  store: {
    songs: {
      getSong: jest.fn(),
      setSong: jest.fn(),
      addSong: jest.fn(),
      addSongs: jest.fn(),
      deleteSong: jest.fn(),
      getAllSongs: () => songListTestData,
      setAllSongs: jest.fn(),
      onChange: jest.fn().mockReturnValue(jest.fn()),
      search: jest.fn(),
    },
    queueItems: {
      getQueueItem: jest.fn(),
      setQueueItem: jest.fn(),
      addQueueItem: jest.fn(),
      deleteQueueItem: jest.fn(),
      getAllQueueItems: () => queueTestDataWithSongs012,
      setAllQueueItems: jest.fn(),
      onChange: jest.fn().mockReturnValue(jest.fn()),
    },
    config: {
      getAudioStatusConfig: () => {
        return {
          songId: '',
          currentTime: 0,
          duration: 0,
          volume: 50,
          pitch: 0,
          vocalsEnabled: true,
          lyricsEnabled: true,
          graphEnabled: true,
          audioInput1Id: 'default',
          audioInput2Id: 'default',
          microphone1Volume: 50,
          microphone2Volume: 50,
          reverb1Volume: 50,
          reverb2Volume: 50,
        };
      },
      setAudioStatusConfig: jest.fn(),
      getSettings: () => {
        return {
          errorMessagesTimeout: 5,
          audioBufferSize: 4096,
          colorThemeId: 0,
        };
      },
      setSettings: jest.fn(),
    },
  },
  preprocess: {
    getSongDetails: jest.fn(),
    processSong: jest.fn(),
    processResult: jest.fn().mockReturnValue(jest.fn()),
    basicPitchProcessSong: jest.fn().mockReturnValue(jest.fn()),
    basicPitchProcessResult: jest.fn(),
  },
  file: {
    read: jest.fn().mockResolvedValue('lyrics'),
    readAsBuffer: jest.fn(),
    ifFileExists: jest.fn(),
    write: jest.fn(),
    getWavFileForReverbPath: jest.fn().mockResolvedValue(''),
  },
};

class MockSource {
  _node = { onaudioprocess: null };

  _soundtouch = null;

  _filter = { sourceSound: { buffer: null } };

  connect = (_other: unknown) => {};

  disconnect = () => {};

  off = () => {};
}

export const mockedAudioStatus = {
  duration: 0,
  setDuration: jest.fn(),
  songEnded: false,
  setSongEnded: jest.fn(),
  isPlaying: false,
  setIsPlaying: jest.fn(),
  isLoading: false,
  setIsLoading: jest.fn(),
  isPlayingVocals: true,
  setIsPlayingVocals: jest.fn(),
  volume: 70,
  setVolume: jest.fn(),
  pitch: 0,
  setPitch: jest.fn(),
  currentTime: 0,
  setCurrentTime: jest.fn(),
  currentSong: null,
  setCurrentSong: jest.fn(),
  nextSong: null,
  setNextSong: jest.fn(),
  lyricsEnabled: true,
  setLyricsEnabled: jest.fn(),
  graphEnabled: true,
  setGraphEnabled: jest.fn(),
  audioContext: new AudioContext() as any,
  gainNode: new AudioContext().createGain() as any,
  source: new MockSource(),
  setSource: jest.fn(),
  microphone1Enabled: false,
  setMicrophone1Enabled: jest.fn(),
  microphone2Enabled: false,
  setMicrophone2Enabled: jest.fn(),
  microphone1Media: null,
  setMicrophone1Media: jest.fn(),
  microphone2Media: null,
  setMicrophone2Media: jest.fn(),
  audioInput1Id: '',
  setAudioInput1Id: jest.fn(),
  audioInput2Id: '',
  setAudioInput2Id: jest.fn(),
  microphone1GainNode: new AudioContext().createGain() as any,
  microphone2GainNode: new AudioContext().createGain() as any,
  microphone1Volume: 70,
  setMicrophone1Volume: jest.fn(),
  microphone2Volume: 70,
  setMicrophone2Volume: jest.fn(),
  reverb1Enabled: false,
  setReverb1Enabled: jest.fn(),
  reverb2Enabled: false,
  setReverb2Enabled: jest.fn(),
  reverb1Media: null,
  setReverb1Media: jest.fn(),
  reverb2Media: null,
  setReverb2Media: jest.fn(),
  reverb1Node: undefined,
  setReverb1Node: jest.fn(),
  reverb2Node: undefined,
  setReverb2Node: jest.fn(),
  reverb1GainNode: new AudioContext().createGain() as any,
  reverb2GainNode: new AudioContext().createGain() as any,
  reverb1Volume: 70,
  setReverb1Volume: jest.fn(),
  reverb2Volume: 70,
  setReverb2Volume: jest.fn(),
};

export default mockedElectron;
