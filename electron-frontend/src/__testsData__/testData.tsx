import { SongProps } from '../components/Song';

export const testSong: SongProps = {
  songId: expect.any(String),
  songName: 'bensound-energy',
  artist: 'bensound',
  songPath: 'C:\\dir\\bensound-energy.mp3',
  lyricsPath: 'C:\\dir\\bensound-energy.lrc',
};

export const testSong2: SongProps = {
  songId: expect.any(String),
  songName: 'bensound-sunny',
  artist: 'bensound',
  songPath: 'C:\\dir\\bensound-sunny.mp3',
  lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
};

export const testSong3: SongProps = {
  songId: expect.any(String),
  songName: 'bensound-betterdays',
  artist: 'bensound',
  songPath: 'C:\\dir\\bensound-betterdays.mp3',
  lyricsPath: 'C:\\dir\\bensound-betterdays.lrc',
};

export const testSong4: SongProps = {
  songId: expect.any(String),
  songName: 'bensound-dubstep',
  artist: 'bensound',
  songPath: 'C:\\dir\\bensound-dubstep.mp3',
  lyricsPath: 'C:\\dir\\bensound-dubstep.lrc',
};

export const testLibrary: SongProps[] = [
  { ...testSong, songId: '1' },
  { ...testSong2, songId: '2' },
];

export const queueWithFourSongs = [
  { song: testSong, queueItemId: '1' },
  { song: testSong2, queueItemId: '2' },
  { song: testSong3, queueItemId: '3' },
  { song: testSong4, queueItemId: '4' },
];

export const sendItemToFrontQueue = [
  { song: testSong4, queueItemId: '4' },
  { song: testSong, queueItemId: '1' },
  { song: testSong2, queueItemId: '2' },
  { song: testSong3, queueItemId: '3' },
];

export const queueAfterDel = [
  { song: testSong, queueItemId: '1' },
  { song: testSong3, queueItemId: '3' },
  { song: testSong4, queueItemId: '4' },
];

export const queueAfterPositionSwap = [
  { song: testSong2, queueItemId: '2' },
  { song: testSong, queueItemId: '1' },
  { song: testSong3, queueItemId: '3' },
  { song: testSong4, queueItemId: '4' },
];

export const queueWithOneSong = [{ song: testSong, queueItemId: '1' }];

export const queueAfterEnqueue = [
  { song: testSong, queueItemId: '1' },
  { song: testSong2, queueItemId: expect.any(String) },
];

export const lineAt5s = 'Line 1';
export const lineAt10s = 'Line 2';
export const lineAt15s = 'Line 3';

export const testLyrics = `
[ar: Artist name]
[al: Song name]
[ti: Song Name]
[by: Artist name]

[00:00.00]
[00:05.00]${lineAt5s}
[00:10.00]${lineAt10s}
[00:15.00]${lineAt15s}`;
