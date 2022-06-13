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
  },
  preprocess: {
    getSongDetails: jest.fn(),
    spleeterProcessSong: jest.fn(),
    spleeterProcessResult: jest.fn().mockReturnValue(jest.fn()),
  },
  file: {
    read: jest.fn().mockResolvedValue('lyrics'),
    ifFileExists: jest.fn(),
  },
};
export default mockedElectron;
