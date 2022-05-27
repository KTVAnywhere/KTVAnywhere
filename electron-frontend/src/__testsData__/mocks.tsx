import { queueTestDataWithSongs012, songListTestData } from './testData';

const mockedElectron = {
  ...window.electron,
  store: {
    songs: {
      getSong: jest.fn(),
      setSong: jest.fn(),
      addSong: jest.fn(),
      deleteSong: jest.fn(),
      getAllSongs: () => songListTestData,
      setAllSongs: jest.fn(),
      onChange: jest.fn(),
    },
    queueItems: {
      getQueueItem: jest.fn(),
      setQueueItem: jest.fn(),
      addQueueItem: jest.fn(),
      deleteQueueItem: jest.fn(),
      getAllQueueItems: () => queueTestDataWithSongs012,
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
