const mockedElectron = {
  ...window.electron,
  store: {
    songs: {
      getSong: jest.fn(),
      setSong: jest.fn(),
      addSong: jest.fn(),
      deleteSong: jest.fn(),
      getAllSongs: jest.fn(),
      setAllSongs: jest.fn(),
      onChange: jest.fn(),
    },
    queueItems: {
      getQueueItem: jest.fn(),
      setQueueItem: jest.fn(),
      addQueueItem: jest.fn(),
      deleteQueueItem: jest.fn(),
      getAllQueueItems: jest.fn(),
      setAllQueueItems: jest.fn(),
      onChange: jest.fn(),
    },
  },
};
export default mockedElectron;
