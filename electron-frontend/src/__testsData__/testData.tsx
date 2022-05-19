/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { SongProps } from '../components/SongItem';

export const queueWithFourSongs = [
  {
    songId: '1',
    songName: 'bensound-energy',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-energy.mp3',
    lyricsPath: 'C:\\dir\\bensound-energy.lrc',
  },

  {
    songId: '2',
    songName: 'bensound-sunny',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-sunny.mp3',
    lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
  },

  {
    songId: '3',
    songName: 'bensound-betterdays',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-betterdays.mp3',
    lyricsPath: 'C:\\dir\\bensound-betterdays.lrc',
  },

  {
    songId: '4',
    songName: 'bensound-dubstep',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-dubstep.mp3',
    lyricsPath: 'C:\\dir\\bensound-dubstep.lrc',
  },
];

export const queueAfterDel = [
  {
    songId: '1',
    songName: 'bensound-energy',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-energy.mp3',
    lyricsPath: 'C:\\dir\\bensound-energy.lrc',
  },
  {
    songId: '3',
    songName: 'bensound-betterdays',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-betterdays.mp3',
    lyricsPath: 'C:\\dir\\bensound-betterdays.lrc',
  },
  {
    songId: '4',
    songName: 'bensound-dubstep',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-dubstep.mp3',
    lyricsPath: 'C:\\dir\\bensound-dubstep.lrc',
  },
];

export const queueAfterPositionSwap = [
  {
    songId: '2',
    songName: 'bensound-sunny',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-sunny.mp3',
    lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
  },
  {
    songId: '1',
    songName: 'bensound-energy',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-energy.mp3',
    lyricsPath: 'C:\\dir\\bensound-energy.lrc',
  },
  {
    songId: '3',
    songName: 'bensound-betterdays',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-betterdays.mp3',
    lyricsPath: 'C:\\dir\\bensound-betterdays.lrc',
  },
  {
    songId: '4',
    songName: 'bensound-dubstep',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-dubstep.mp3',
    lyricsPath: 'C:\\dir\\bensound-dubstep.lrc',
  },
];

export const originalQueue = [
  {
    songId: '1',
    songName: 'bensound-energy',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-energy.mp3',
    lyricsPath: 'C:\\dir\\bensound-energy.lrc',
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
    songId: '1',
    songName: 'bensound-energy',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-energy.mp3',
    lyricsPath: 'C:\\dir\\bensound-energy.lrc',
  },
  {
    songId: '2',
    songName: 'bensound-sunny',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-sunny.mp3',
    lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
  },
];

export const queueAfterDequeue = [
  {
    songId: '2',
    songName: 'bensound-sunny',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-sunny.mp3',
    lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
  },
];

export const songItemDequeued = {
  songId: '1',
  songName: 'bensound-energy',
  artist: 'bensound',
  songPath: 'C:\\dir\\bensound-energy.mp3',
  lyricsPath: 'C:\\dir\\bensound-energy.lrc',
};

export const emptyQueue: SongProps[] = [];
