import '@testing-library/jest-dom';
import { queueItemFunctions, songFunctions } from '../main/db';
import { SongProps } from '../components/SongItem';
import { QueueItemProps } from '../components/SongsQueue';
import {
  testLibrary,
  queueWithFourSongs,
  queueAfterPositionSwap,
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
    data = testLibrary;
  });
  afterEach(() => {
    mockGet.mockClear();
    mockSet.mockClear();
  });
  test('get song based on songId', () => {
    const { getSong } = songFunctions;
    expect(getSong(songsStore, '1')).toEqual(testLibrary[0]);
  });
  test('add song to end of songs store', () => {
    const toAdd: SongProps = {
      songId: '3',
      songName: 'Test song 3',
      artist: 'Test artist 3',
      songPath: 'C:\\dir\\file3.mp3',
      lyricsPath: 'C:\\dir\\lyrics3.lrc',
    };
    const { addSong } = songFunctions;
    addSong(songsStore, toAdd);
    expect(mockSet).toBeCalledWith('songs', [...testLibrary, toAdd]);
  });
  test('change song in list', () => {
    const newTestSong: SongProps = {
      ...testLibrary[1],
      songName: 'new test song',
    };
    const { setSong } = songFunctions;
    setSong(songsStore, newTestSong);
    expect(mockSet).toBeCalledWith('songs', [
      ...testLibrary.slice(0, 1),
      newTestSong,
    ]);
  });
  test('delete song', () => {
    const { deleteSong } = songFunctions;
    deleteSong(songsStore, '1');
    expect(mockSet).toBeCalledWith('songs', [...testLibrary.slice(1)]);
  });
  test('get all songs', () => {
    const { getAllSongs } = songFunctions;
    expect(getAllSongs(songsStore)).toEqual(testLibrary);
  });
  test('set all songs', () => {
    const newTestLibrary: SongProps[] = [
      {
        songId: '3',
        songName: 'Test song 3',
        artist: 'Test artist 3',
        songPath: 'C:\\dir\\file3.mp3',
        lyricsPath: 'C:\\dir\\lyrics3.lrc',
      },
      {
        songId: '4',
        songName: 'Test song 4',
        artist: 'Test artist 4',
        songPath: 'C:\\dir\\file4.mp3',
        lyricsPath: 'C:\\dir\\lyrics4.lrc',
      },
    ];
    const { setAllSongs } = songFunctions;
    setAllSongs(songsStore, newTestLibrary);
    expect(mockSet).toBeCalledWith('songs', newTestLibrary);
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
    data = queueWithFourSongs;
  });
  afterEach(() => {
    mockGet.mockClear();
    mockSet.mockClear();
  });

  test('get queueItem based on queueItemId', () => {
    const { getQueueItem } = queueItemFunctions;
    expect(getQueueItem(queueItemsStore, '1')).toEqual(queueWithFourSongs[0]);
  });
  test('add queueItem to end of queueItems store', () => {
    const toAdd: QueueItemProps = {
      song: {
        songId: '5',
        songName: 'Test song 5',
        artist: 'Test artist 5',
        songPath: 'C:\\dir\\file5.mp3',
        lyricsPath: 'C:\\dir\\lyrics5.lrc',
      },
      queueItemId: '5',
    };
    const { addQueueItem } = queueItemFunctions;
    addQueueItem(queueItemsStore, toAdd);
    expect(mockSet).toBeCalledWith('queueItems', [
      ...queueWithFourSongs,
      toAdd,
    ]);
  });
  test('change queueItem in queueItems store', () => {
    const newTestQueueItem: QueueItemProps = {
      ...queueWithFourSongs[0],
      song: {
        ...queueWithFourSongs[0].song,
        songName: 'new test song',
      },
    };
    const { setQueueItem } = queueItemFunctions;
    setQueueItem(queueItemsStore, newTestQueueItem);
    expect(mockSet).toBeCalledWith('queueItems', [
      newTestQueueItem,
      ...queueWithFourSongs.slice(1),
    ]);
  });
  test('delete queueItem', () => {
    const { deleteQueueItem } = queueItemFunctions;
    deleteQueueItem(queueItemsStore, '2');
    expect(mockSet).toBeCalledWith('queueItems', [
      ...queueWithFourSongs.slice(0, 1),
      ...queueWithFourSongs.slice(2),
    ]);
  });
  test('get all queueItems', () => {
    const { getAllQueueItems } = queueItemFunctions;
    expect(getAllQueueItems(queueItemsStore)).toEqual(queueWithFourSongs);
  });
  test('set all queueItems', () => {
    const { setAllQueueItems } = queueItemFunctions;
    setAllQueueItems(queueItemsStore, queueAfterPositionSwap);
    expect(mockSet).toBeCalledWith('queueItems', queueAfterPositionSwap);
  });
});
