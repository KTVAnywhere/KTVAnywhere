import { queueWithFourSongs, testLibrary } from './testData';

const mockedElectron = {
  ...window.electron,
  store: {
    songs: {
      getSong: jest.fn(),
      setSong: jest.fn(),
      addSong: jest.fn(),
      deleteSong: jest.fn(),
      getAllSongs: () => testLibrary,
      setAllSongs: jest.fn(),
      onChange: jest.fn(),
    },
    queueItems: {
      getQueueItem: jest.fn(),
      setQueueItem: jest.fn(),
      addQueueItem: jest.fn(),
      deleteQueueItem: jest.fn(),
      getAllQueueItems: () => queueWithFourSongs,
      setAllQueueItems: jest.fn(),
      onChange: jest.fn(),
    },
  },
  file: {
    readSend: jest.fn(),
    readReceive: jest.fn(),
  },
};
export default mockedElectron;
