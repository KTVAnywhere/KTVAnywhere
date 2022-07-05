import { Schema } from 'electron-store';
import { SongProps } from '../components/Song';
import { QueueItemProps } from '../components/SongsQueue';

interface Song {
  song: SongProps;
}

interface QueueItem {
  queueItem: QueueItemProps;
}

export interface SongsType {
  songs: SongProps[];
}

export interface QueueItemsType {
  queueItems: QueueItemProps[];
}

export interface ConfigType {
  playingSong: {
    songId: string;
    currentTime: number;
    duration: number;
    volume: number;
    pitch: number;
    vocalsEnabled: boolean;
    lyricsEnabled: boolean;
  };
  settings: {
    errorMessagesTimeout: number;
    audioBufferSize: number;
    colorThemeId: number;
  };
}

const songSchema: Schema<Song> = {
  song: {
    type: 'object',
    properties: {
      songId: { type: 'string' },
      songName: { type: 'string' },
      artist: { type: 'string' },
      songPath: { type: 'string' },
      lyricsPath: { type: 'string' },
      vocalsPath: { type: 'string' },
      accompanimentPath: { type: 'string' },
      graphPath: { type: 'string' },
    },
    required: ['songId', 'songName', 'songPath'],
  },
};

const queueItemSchema: Schema<QueueItem> = {
  queueItem: {
    type: 'object',
    properties: {
      queueItemId: { type: 'string' },
      song: { ...songSchema.song },
    },
    required: ['queueItemId', 'song'],
  },
};

const songsSchema: Schema<SongsType> = {
  songs: {
    type: 'array',
    items: { ...songSchema.song },
  },
};

const queueItemsSchema: Schema<QueueItemsType> = {
  queueItems: {
    type: 'array',
    items: { ...queueItemSchema.queueItem },
  },
};

const configSchema: Schema<ConfigType> = {
  playingSong: {
    type: 'object',
    properties: {
      songId: { type: 'string' },
      currentTime: { type: 'number' },
      duration: { type: 'number' },
      volume: { type: 'number' },
      pitch: { type: 'number' },
      vocalsEnabled: { type: 'boolean' },
      lyricsEnabled: { type: 'boolean' },
    },
  },
  settings: {
    type: 'object',
    properties: {
      errorMessagesTimeout: { type: 'number' },
      audioBufferSize: { type: 'number' },
    },
  },
};

const schemas: {
  songsSchema: Schema<SongsType>;
  queueItemsSchema: Schema<QueueItemsType>;
  configSchema: Schema<ConfigType>;
} = {
  songsSchema,
  queueItemsSchema,
  configSchema,
};

export default schemas;
