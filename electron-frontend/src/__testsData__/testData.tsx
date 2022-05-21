import { QueueItemProps } from '../components/SongsQueue';
import { SongProps } from '../components/SongItem';

export const testSong: SongProps = {
  songId: expect.any(String),
  songName: 'Test song',
  artist: 'Test artist',
  songPath: 'C:\\dir\\file.mp3',
  lyricsPath: 'C:\\dir\\lyrics.lrc',
};

export const testSong2: SongProps = {
  songId: expect.any(String),
  songName: 'Test song 2',
  artist: 'Test artist 2',
  songPath: 'C:\\dir\\file2.mp3',
  lyricsPath: 'C:\\dir\\lyrics2.lrc',
};

export const testLibrary: SongProps[] = [
  { ...testSong, songId: '1' },
  { ...testSong2, songId: '2' },
];

export const queueWithFourSongs = [
  {
    song: {
      songId: '1',
      songName: 'bensound-energy',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-energy.mp3',
      lyricsPath: 'C:\\dir\\bensound-energy.lrc',
    },
    queueItemId: '1',
  },
  {
    song: {
      songId: '2',
      songName: 'bensound-sunny',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-sunny.mp3',
      lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
    },
    queueItemId: '2',
  },
  {
    song: {
      songId: '3',
      songName: 'bensound-betterdays',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-betterdays.mp3',
      lyricsPath: 'C:\\dir\\bensound-betterdays.lrc',
    },
    queueItemId: '3',
  },
  {
    song: {
      songId: '4',
      songName: 'bensound-dubstep',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-dubstep.mp3',
      lyricsPath: 'C:\\dir\\bensound-dubstep.lrc',
    },
    queueItemId: '4',
  },
];

export const queueAfterDel = [
  {
    song: {
      songId: '1',
      songName: 'bensound-energy',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-energy.mp3',
      lyricsPath: 'C:\\dir\\bensound-energy.lrc',
    },
    queueItemId: '1',
  },
  {
    song: {
      songId: '3',
      songName: 'bensound-betterdays',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-betterdays.mp3',
      lyricsPath: 'C:\\dir\\bensound-betterdays.lrc',
    },
    queueItemId: '3',
  },
  {
    song: {
      songId: '4',
      songName: 'bensound-dubstep',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-dubstep.mp3',
      lyricsPath: 'C:\\dir\\bensound-dubstep.lrc',
    },
    queueItemId: '4',
  },
];

export const queueAfterPositionSwap = [
  {
    song: {
      songId: '2',
      songName: 'bensound-sunny',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-sunny.mp3',
      lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
    },
    queueItemId: '2',
  },
  {
    song: {
      songId: '1',
      songName: 'bensound-energy',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-energy.mp3',
      lyricsPath: 'C:\\dir\\bensound-energy.lrc',
    },
    queueItemId: '1',
  },
  {
    song: {
      songId: '3',
      songName: 'bensound-betterdays',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-betterdays.mp3',
      lyricsPath: 'C:\\dir\\bensound-betterdays.lrc',
    },
    queueItemId: '3',
  },
  {
    song: {
      songId: '4',
      songName: 'bensound-dubstep',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-dubstep.mp3',
      lyricsPath: 'C:\\dir\\bensound-dubstep.lrc',
    },
    queueItemId: '4',
  },
];

export const originalQueue = [
  {
    song: {
      songId: '1',
      songName: 'bensound-energy',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-energy.mp3',
      lyricsPath: 'C:\\dir\\bensound-energy.lrc',
    },
    queueItemId: '1',
  },
];

export const songItemToEnqueue = {
  songId: '2',
  songName: 'bensound-sunny',
  artist: 'bensound',
  songPath: 'C:\\dir\\bensound-sunny.mp3',
  lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
};

export const queueAfterEnqueue = [
  {
    song: {
      songId: '1',
      songName: 'bensound-energy',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-energy.mp3',
      lyricsPath: 'C:\\dir\\bensound-energy.lrc',
    },
    queueItemId: '1',
  },
  {
    song: {
      songId: '2',
      songName: 'bensound-sunny',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-sunny.mp3',
      lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
    },
    queueItemId: expect.any(String),
  },
];

export const queueAfterDequeue = [
  {
    song: {
      songId: '2',
      songName: 'bensound-sunny',
      artist: 'bensound',
      songPath: 'C:\\dir\\bensound-sunny.mp3',
      lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
    },
    queueItemId: '2',
  },
];

export const songItemDequeued = {
  songId: '1',
  songName: 'bensound-energy',
  artist: 'bensound',
  songPath: 'C:\\dir\\bensound-energy.mp3',
  lyricsPath: 'C:\\dir\\bensound-energy.lrc',
};

export const emptyQueue: QueueItemProps[] = [];
