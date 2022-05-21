import Store from 'electron-store';
import schemas, { SongsType, QueueItemsType } from './schema';
import { SongProps } from '../components/SongItem';
import { QueueItemProps } from '../components/SongsQueue';

export const createSongsStore = () =>
  new Store<SongsType>({
    name: 'songs',
    schema: schemas.songsSchema,
    watch: true,
    defaults: { songs: [] },
  });

export const createQueueItemsStore = () =>
  new Store<QueueItemsType>({
    name: 'queueItems',
    schema: schemas.queueItemsSchema,
    watch: true,
    defaults: { queueItems: [] },
  });

export const songFunctions = {
  getSong: (store: Store<SongsType>, songId: string) =>
    store.get('songs').find((song) => song.songId === songId),

  setSong: (store: Store<SongsType>, song: SongProps) => {
    const newSongs = store
      .get('songs')
      .map((oldSong) => (oldSong.songId === song.songId ? song : oldSong));
    store.set('songs', newSongs);
  },
  addSong: (store: Store<SongsType>, song: SongProps) => {
    const newSongs = [...store.get('songs'), song];
    store.set('songs', newSongs);
  },
  deleteSong: (store: Store<SongsType>, songId: string) => {
    store.set(
      'songs',
      store.get('songs').filter((song) => song.songId !== songId)
    );
  },
  getAllSongs: (store: Store<SongsType>) => store.get('songs'),
  setAllSongs: (store: Store<SongsType>, songs: SongProps[]) =>
    store.set('songs', songs),
};

export const queueItemFunctions = {
  getQueueItem: (store: Store<QueueItemsType>, queueItemId: string) =>
    store.get('queueItems').find((queue) => queue.queueItemId === queueItemId),
  setQueueItem: (store: Store<QueueItemsType>, queueItem: QueueItemProps) => {
    const newQueue = store
      .get('queueItems')
      .map((oldQueueItem) =>
        oldQueueItem.queueItemId === queueItem.queueItemId
          ? queueItem
          : oldQueueItem
      );
    store.set('queueItems', newQueue);
  },
  addQueueItem: (store: Store<QueueItemsType>, queueItem: QueueItemProps) => {
    const newQueue = [...store.get('queueItems'), queueItem];
    store.set('queueItems', newQueue);
  },
  deleteQueueItem: (store: Store<QueueItemsType>, queueItemId: string) => {
    store.set(
      'queueItems',
      store
        .get('queueItems')
        .filter((queueItem) => queueItem.queueItemId !== queueItemId)
    );
  },
  getAllQueueItems: (store: Store<QueueItemsType>) => store.get('queueItems'),
  setAllQueueItems: (
    store: Store<QueueItemsType>,
    queueItems: QueueItemProps[]
  ) => {
    store.set('queueItems', queueItems);
  },
};
