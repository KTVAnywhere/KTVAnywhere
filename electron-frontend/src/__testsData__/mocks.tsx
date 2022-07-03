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
      getPlayingSong: () => {
        return {
          songId: '',
          currentTime: 0,
          duration: 0,
          volume: 50,
          pitch: 0,
          vocalsEnabled: true,
          lyricsEnabled: true,
        };
      },
      setPlayingSong: jest.fn(),
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
    spleeterProcessSong: jest.fn(),
    spleeterProcessResult: jest.fn().mockReturnValue(jest.fn()),
  },
  file: {
    read: jest.fn().mockResolvedValue('lyrics'),
    readAsBuffer: jest.fn(),
    ifFileExists: jest.fn(),
    write: jest.fn(),
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
};

export default mockedElectron;
