import '@testing-library/jest-dom';
import { queueItemFunctions, songFunctions } from '../main/database';
import { SongProps } from '../components/Song';
import { QueueItemProps } from '../components/SongsQueue';
import {
  songListTestData,
  queueTestDataWithSongs012,
  queueTestDataWithSongs102,
} from '../__testsData__/testData';

const ActualStore = jest.requireActual('electron-store');

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

  beforeEach(() => {
    data = songListTestData;
  });
  afterEach(() => {
    mockGet.mockClear();
    mockSet.mockClear();
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
    addSong(songsStore, toAdd);
    expect(mockSet).toBeCalledWith('songs', [...songListTestData, toAdd]);
  });
  test('change song in list', () => {
    const newTestSong: SongProps = {
      ...songListTestData[1],
      songName: 'new test song',
    };
    const { setSong } = songFunctions;
    setSong(songsStore, newTestSong);
    expect(mockSet).toBeCalledWith('songs', [
      ...songListTestData.slice(0, 1),
      newTestSong,
    ]);
  });
  test('delete song', () => {
    const { deleteSong } = songFunctions;
    deleteSong(songsStore, '0');
    expect(mockSet).toBeCalledWith('songs', [...songListTestData.slice(1)]);
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
    setAllSongs(songsStore, newsongListTestData);
    expect(mockSet).toBeCalledWith('songs', newsongListTestData);
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
