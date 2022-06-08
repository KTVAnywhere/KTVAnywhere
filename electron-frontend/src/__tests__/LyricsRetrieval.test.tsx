import '@testing-library/jest-dom';
import { findLyric, findNeteaseSongId } from '../main/util';
import { songListTestData, testLyrics } from '../__testsData__/testData';

describe('Netease lyrics search', () => {
  const actualNetease = jest.requireActual('simple-netease-cloud-music');
  const mockSearch = jest.fn().mockResolvedValue({
    result: {
      songs: [{ id: '12345' }, { id: '67890' }],
    },
  });
  const mockLyric = jest.fn().mockResolvedValue({
    lrc: { lyric: testLyrics },
  });
  const mockNetease = {
    ...actualNetease,
    search: mockSearch,
    lyric: mockLyric,
  };
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('findNetEaseSongId should search using songName and artist and return id of first song result', async () => {
    const { songName, artist } = songListTestData[0];
    const netEaseSongId = await findNeteaseSongId(
      mockNetease,
      songName,
      artist
    );
    expect(mockSearch.mock.calls[0][0]).toEqual(`${songName} ${artist}`);
    expect(netEaseSongId).toEqual('12345');
  });
  test('findLyric should take in netEaseSongId return lyrics', async () => {
    const lyrics = await findLyric(mockNetease, '12345');
    expect(mockLyric).toBeCalledWith('12345');
    expect(lyrics).toEqual(testLyrics);
  });
});
