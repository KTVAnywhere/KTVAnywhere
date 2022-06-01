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
    preprocess: {
      getSongDetails: jest.fn(),
    },
  },
  file: {
    read: jest.fn().mockResolvedValue('lyrics'),
  },
};
export default mockedElectron;
