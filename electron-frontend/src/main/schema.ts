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
  audioStatusConfig: {
    songId: string;
    currentTime: number;
    duration: number;
    volume: number;
    pitch: number;
    vocalsEnabled: boolean;
    lyricsEnabled: boolean;
    graphEnabled: boolean;
    audioInput1Id: string;
    audioInput2Id: string;
    microphone1Volume: number;
    microphone2Volume: number;
    reverb1Volume: number;
    reverb2Volume: number;
    microphone1NoiseSuppression: boolean;
    microphone2NoiseSuppression: boolean;
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
  audioStatusConfig: {
    type: 'object',
    properties: {
      songId: { type: 'string' },
      currentTime: { type: 'number' },
      duration: { type: 'number' },
      volume: { type: 'number' },
      pitch: { type: 'number' },
      vocalsEnabled: { type: 'boolean' },
      lyricsEnabled: { type: 'boolean' },
      graphEnabled: { type: 'boolean' },
      audioInput1Id: { type: 'string' },
      audioInput2Id: { type: 'string' },
      microphone1Volume: { type: 'number' },
      microphone2Volume: { type: 'number' },
      reverb1Volume: { type: 'number' },
      reverb2Volume: { type: 'number' },
      microphone1NoiseSuppression: { type: 'boolean' },
      microphone2NoiseSuppression: { type: 'boolean' },
    },
  },
  settings: {
    type: 'object',
    properties: {
      errorMessagesTimeout: { type: 'number' },
      audioBufferSize: { type: 'number' },
      colorThemeId: { type: 'number' },
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
