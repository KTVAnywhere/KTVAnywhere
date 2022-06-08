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

const schemas: {
  songsSchema: Schema<SongsType>;
  queueItemsSchema: Schema<QueueItemsType>;
} = {
  songsSchema,
  queueItemsSchema,
};

export default schemas;
