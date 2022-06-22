import '@testing-library/jest-dom';
import Fuse from 'fuse.js';
import {
  configFunctions,
  queueItemFunctions,
  songFunctions,
} from '../main/database';
import { ConfigType } from '../main/schema';
import { SongProps } from '../components/Song';
import { QueueItemProps } from '../components/SongsQueue';
import {
  songListTestData,
  queueTestDataWithSongs012,
  queueTestDataWithSongs102,
} from '../__testsData__/testData';

const ActualStore = jest.requireActual('electron-store');
const ActualFuse = jest.requireActual('fuse.js');

describe('songs store', () => {
  let data: SongProps[] = [];
  const mockGet = jest.fn(() => data);
  const mockSet = jest.fn((_, songs: SongProps[]) => {
    data = songs;
  });

  const songsStore = {
    ...new ActualStore({}),
    get: mockGet,
    set: mockSet,
  };

  const mockIndexAdd = jest.fn();
  const mockIndexRemove = jest.fn();
  const mockIndexSet = jest.fn();
  const songSearcher = {
    ...new ActualFuse([]),
    add: mockIndexAdd,
    remove: mockIndexRemove,
    setCollection: mockIndexSet,
    getIndex: () => ({} as Fuse.FuseIndex<SongProps>),
  };

  beforeEach(() => {
    data = songListTestData;
  });
  afterEach(() => {
    mockGet.mockClear();
    mockSet.mockClear();
    mockIndexAdd.mockClear();
    mockIndexRemove.mockClear();
  });
  test('get song based on songId', () => {
    const { getSong } = songFunctions;
    expect(getSong(songsStore, '0')).toEqual(songListTestData[0]);
  });
  test('add song to end of songs store', () => {
    const toAdd: SongProps = {
      songId: '2',
      songName: 'Test song 2',
      artist: 'Test artist 2',
      songPath: 'C:\\dir\\file2.mp3',
      lyricsPath: 'C:\\dir\\lyrics2.lrc',
      vocalsPath: '',
      accompanimentPath: '',
    };
    const { addSong } = songFunctions;
    addSong(songsStore, songSearcher, toAdd);
    expect(mockSet).toBeCalledWith('songs', [...songListTestData, toAdd]);
    expect(mockIndexAdd).toBeCalledWith(toAdd);
  });
  test('change song in list', () => {
    const newTestSong: SongProps = {
      ...songListTestData[1],
      songName: 'new test song',
    };
    const { setSong } = songFunctions;
    setSong(songsStore, songSearcher, newTestSong);
    expect(mockSet).toBeCalledWith('songs', [
      ...songListTestData.slice(0, 1),
      newTestSong,
    ]);
    expect(mockIndexRemove.mock.calls[0][0](newTestSong)).toEqual(true);
    expect(mockIndexAdd).toBeCalledWith(newTestSong);
  });
  test('delete song', () => {
    const { deleteSong } = songFunctions;
    deleteSong(songsStore, songSearcher, '0');
    expect(mockSet).toBeCalledWith('songs', [...songListTestData.slice(1)]);
    expect(mockIndexRemove.mock.calls[0][0](songListTestData[0])).toEqual(true);
  });
  test('get all songs', () => {
    const { getAllSongs } = songFunctions;
    expect(getAllSongs(songsStore)).toEqual(songListTestData);
  });
  test('set all songs', () => {
    const newsongListTestData: SongProps[] = [
      {
        songId: '2',
        songName: 'Test song 2',
        artist: 'Test artist 2',
        songPath: 'C:\\dir\\file2.mp3',
        lyricsPath: 'C:\\dir\\lyrics2.lrc',
        vocalsPath: '',
        accompanimentPath: '',
      },
      {
        songId: '3',
        songName: 'Test song 3',
        artist: 'Test artist 3',
        songPath: 'C:\\dir\\file3.mp3',
        lyricsPath: 'C:\\dir\\lyrics3.lrc',
        vocalsPath: '',
        accompanimentPath: '',
      },
    ];
    const { setAllSongs } = songFunctions;
    setAllSongs(songsStore, songSearcher, newsongListTestData);
    expect(mockSet).toBeCalledWith('songs', newsongListTestData);
    expect(mockIndexSet).toBeCalledWith(newsongListTestData);
  });
});

describe('queueItems store', () => {
  let data: QueueItemProps[] = [];
  const mockGet = jest.fn(() => data);
  const mockSet = jest.fn((_, songs: QueueItemProps[]) => {
    data = songs;
  });
  const queueItemsStore = {
    ...new ActualStore({}),
    get: mockGet,
    set: mockSet,
  };

  beforeEach(() => {
    data = queueTestDataWithSongs012;
  });
  afterEach(() => {
    mockGet.mockClear();
    mockSet.mockClear();
  });

  test('get queueItem based on queueItemId', () => {
    const { getQueueItem } = queueItemFunctions;
    expect(getQueueItem(queueItemsStore, '0')).toEqual(
      queueTestDataWithSongs012[0]
    );
  });
  test('add queueItem to end of queueItems store', () => {
    const toAdd: QueueItemProps = {
      song: {
        songId: '3',
        songName: 'Test song 3',
        artist: 'Test artist 3',
        songPath: 'C:\\dir\\file3.mp3',
        lyricsPath: 'C:\\dir\\lyrics3.lrc',
        vocalsPath: '',
        accompanimentPath: '',
      },
      queueItemId: '3',
    };
    const { addQueueItem } = queueItemFunctions;
    addQueueItem(queueItemsStore, toAdd);
    expect(mockSet).toBeCalledWith('queueItems', [
      ...queueTestDataWithSongs012,
      toAdd,
    ]);
  });
  test('change queueItem in queueItems store', () => {
    const newTestQueueItem: QueueItemProps = {
      ...queueTestDataWithSongs012[0],
      song: {
        ...queueTestDataWithSongs012[0].song,
        songName: 'new test song',
      },
    };
    const { setQueueItem } = queueItemFunctions;
    setQueueItem(queueItemsStore, newTestQueueItem);
    expect(mockSet).toBeCalledWith('queueItems', [
      newTestQueueItem,
      ...queueTestDataWithSongs012.slice(1),
    ]);
  });
  test('delete queueItem', () => {
    const { deleteQueueItem } = queueItemFunctions;
    deleteQueueItem(queueItemsStore, '1');
    expect(mockSet).toBeCalledWith('queueItems', [
      ...queueTestDataWithSongs012.slice(0, 1),
      ...queueTestDataWithSongs012.slice(2),
    ]);
  });
  test('get all queueItems', () => {
    const { getAllQueueItems } = queueItemFunctions;
    expect(getAllQueueItems(queueItemsStore)).toEqual(
      queueTestDataWithSongs012
    );
  });
  test('set all queueItems', () => {
    const { setAllQueueItems } = queueItemFunctions;
    setAllQueueItems(queueItemsStore, queueTestDataWithSongs102);
    expect(mockSet).toBeCalledWith('queueItems', queueTestDataWithSongs102);
  });
});

describe('config store', () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();

  const configStore = {
    ...new ActualStore({}),
    get: mockGet,
    set: mockSet,
  };

  afterEach(() => {
    mockGet.mockClear();
    mockSet.mockClear();
  });

  test('get settings for playing song', () => {
    const { getPlayingSong } = configFunctions;
    getPlayingSong(configStore);
    expect(mockGet).toBeCalled();
  });

  test('set settings for playing song', () => {
    const { setPlayingSong } = configFunctions;
    const playingSong: ConfigType['playingSong'] = {
      songId: '1',
      currentTime: 5,
      duration: 10,
      volume: 50,
      pitch: 0,
      vocalsEnabled: true,
      lyricsEnabled: true,
    };
    setPlayingSong(configStore, playingSong);
    expect(mockSet).toBeCalledWith('playingSong', playingSong);
  });

  test('get settings', () => {
    const { getSettings } = configFunctions;
    getSettings(configStore);
    expect(mockGet).toBeCalled();
  });

  test('set settings', () => {
    const { setSettings } = configFunctions;
    const updatedSettings: ConfigType['settings'] = {
      errorMessagesTimeout: 5,
      audioBufferSize: 8192,
    };
    setSettings(configStore, updatedSettings);
    expect(mockSet).toBeCalledWith('settings', updatedSettings);
  });
});
