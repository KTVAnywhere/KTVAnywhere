import { SongProps } from '../components/Song';
import { NoteEventTime } from '../components/PitchGraph';

export const songTestData: SongProps[] = [
  {
    songId: expect.any(String),
    songName: 'bensound-energy',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-energy.mp3',
    lyricsPath: 'C:\\dir\\bensound-energy.lrc',
    vocalsPath: '',
    accompanimentPath: '',
    graphPath: '',
  },
  {
    songId: expect.any(String),
    songName: 'bensound-sunny',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-sunny.mp3',
    lyricsPath: 'C:\\dir\\bensound-sunny.lrc',
    vocalsPath: 'C:\\dir\\bensound-sunny\\vocals.mp3',
    accompanimentPath: 'C:\\dir\\bensound-sunny\\accompaniment.mp3',
    graphPath: 'C:\\dir\\bensound-sunny\\graph.json',
  },
  {
    songId: expect.any(String),
    songName: 'bensound-betterdays',
    artist: 'bensound',
    songPath: 'C:\\dir\\bensound-betterdays.mp3',
    lyricsPath: '',
    vocalsPath: 'C:\\dir\\bensound-betterdays\\vocals.mp3',
    accompanimentPath: 'C:\\dir\\bensound-betterdays\\accompaniment.mp3',
    graphPath: 'C:\\dir\\bensound-betterdays\\graph.json',
  },
];

export const songListTestData: SongProps[] = [
  { ...songTestData[0], songId: '0' },
  { ...songTestData[1], songId: '1' },
];

export const queueTestDataWithSong0 = [
  { song: songTestData[0], queueItemId: '0' },
];

export const queueTestDataWithSongs012 = [
  { song: songTestData[0], queueItemId: '0' },
  { song: songTestData[1], queueItemId: '1' },
  { song: songTestData[2], queueItemId: '2' },
];

export const queueTestDataWithSongs201 = [
  { song: songTestData[2], queueItemId: '2' },
  { song: songTestData[0], queueItemId: '0' },
  { song: songTestData[1], queueItemId: '1' },
];

export const queueTestDataWithSongs02 = [
  { song: songTestData[0], queueItemId: '0' },
  { song: songTestData[2], queueItemId: '2' },
];

export const queueTestDataWithSongs102 = [
  { song: songTestData[1], queueItemId: '1' },
  { song: songTestData[0], queueItemId: '0' },
  { song: songTestData[2], queueItemId: '2' },
];

export const queueTestDataWithSongs01 = [
  { song: songTestData[0], queueItemId: '0' },
  { song: songTestData[1], queueItemId: expect.any(String) },
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

export const testGraph: NoteEventTime[] = [
  {
    startTimeSeconds: 5,
    durationSeconds: 1,
    pitchMidi: 50,
    amplitude: expect.any(Number),
  },
  {
    startTimeSeconds: 7,
    durationSeconds: 2,
    pitchMidi: 51,
    amplitude: expect.any(Number),
  },
  {
    startTimeSeconds: 15,
    durationSeconds: 3,
    pitchMidi: 55,
    amplitude: expect.any(Number),
  },
];
