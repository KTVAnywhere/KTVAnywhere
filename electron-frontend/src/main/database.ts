import Store from 'electron-store';
import Fuse from 'fuse.js';
import schemas, { SongsType, QueueItemsType, ConfigType } from './schema';
import { SongProps } from '../components/Song';
import { QueueItemProps } from '../components/SongsQueue';

export const configStoreDefaults = {
  audioStatusConfig: {
    songId: '',
    currentTime: 0,
    duration: 0,
    volume: 50,
    pitch: 0,
    vocalsEnabled: true,
    lyricsEnabled: false,
    graphEnabled: false,
    audioInput1Id: 'default',
    audioInput2Id: 'default',
    microphone1Volume: 50,
    microphone2Volume: 50,
    reverb1Volume: 50,
    reverb2Volume: 50,
    microphone1NoiseSuppression: false,
    microphone2NoiseSuppression: false,
  },
  settings: {
    errorMessagesTimeout: 5,
    audioBufferSize: 4096,
    colorThemeId: 0,
  },
};

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

export const createConfigStore = () =>
  new Store<ConfigType>({
    schema: schemas.configSchema,
    watch: true,
    defaults: configStoreDefaults,
  });

export const songFunctions = {
  getSong: (store: Store<SongsType>, songId: string) =>
    store.get('songs').find((song) => song.songId === songId),

  setSong: (
    store: Store<SongsType>,
    songSearcher: Fuse<SongProps>,
    song: SongProps
  ) => {
    const newSongs = store
      .get('songs')
      .map((oldSong) => (oldSong.songId === song.songId ? song : oldSong));
    store.set('songs', newSongs);
    songSearcher.remove((oldSong) => oldSong.songId === song.songId);
    songSearcher.add(song);
  },
  addSong: (
    store: Store<SongsType>,
    songSearcher: Fuse<SongProps>,
    song: SongProps
  ) => {
    const newSongs = [...store.get('songs'), song];
    store.set('songs', newSongs);
    songSearcher.add(song);
  },
  addSongs: (
    store: Store<SongsType>,
    songs: SongProps[],
    songSearcher: Fuse<SongProps>,
    prepend: boolean
  ) => {
    const newSongs = prepend
      ? [...songs, ...store.get('songs')]
      : [...store.get('songs'), ...songs];
    store.set('songs', newSongs);
    songs.forEach((song) => songSearcher.add(song));
  },
  deleteSong: (
    store: Store<SongsType>,
    songSearcher: Fuse<SongProps>,
    songId: string
  ) => {
    store.set(
      'songs',
      store.get('songs').filter((song) => song.songId !== songId)
    );
    songSearcher.remove((song) => song.songId === songId);
  },
  getAllSongs: (store: Store<SongsType>) => store.get('songs'),
  setAllSongs: (
    store: Store<SongsType>,
    songSearcher: Fuse<SongProps>,
    songs: SongProps[]
  ) => {
    store.set('songs', songs);
    songSearcher.setCollection(songs);
  },
  getRandomSong: (store: Store<SongsType>) => {
    const allSongs = store.get('songs');
    return allSongs.length > 0
      ? allSongs[Math.floor(Math.random() * allSongs.length)]
      : null;
  },
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
  enqueueItem: (store: Store<QueueItemsType>, queueItem: QueueItemProps) => {
    const newQueue = [...store.get('queueItems'), queueItem];
    store.set('queueItems', newQueue);
  },
  dequeueItem: (
    queueStore: Store<QueueItemsType>,
    songStore: Store<SongsType>
  ) => {
    const queue = queueStore.get('queueItems');
    const nextSong =
      (queue.length > 0 &&
        songStore
          .get('songs')
          .find((song) => song.songId === queue[0].song.songId)) ||
      null;
    if (queue.length > 0) {
      queueStore.set('queueItems', [...queue.slice(1)]);
    }
    return nextSong;
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
  shuffleQueue: (store: Store<QueueItemsType>) => {
    const newQueue = store.get('queueItems');
    // Fisher-Yates algorithm
    if (newQueue.length === 0) return;
    let currentIndex = newQueue.length;
    let randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      [newQueue[currentIndex], newQueue[randomIndex]] = [
        newQueue[randomIndex],
        newQueue[currentIndex],
      ];
    }

    store.set('queueItems', newQueue);
  },
  getQueueLength: (store: Store<QueueItemsType>) =>
    store.get('queueItems').length,
};

export const configFunctions = {
  getAudioStatusConfig: (store: Store<ConfigType>) => {
    return {
      ...configStoreDefaults.audioStatusConfig,
      ...store.get('audioStatusConfig'),
    };
  },
  setAudioStatusConfig: (
    store: Store<ConfigType>,
    audioStatusConfig: ConfigType['audioStatusConfig']
  ) => store.set('audioStatusConfig', audioStatusConfig),
  getSettings: (store: Store<ConfigType>) => store.get('settings'),
  setSettings: (store: Store<ConfigType>, settings: ConfigType['settings']) =>
    store.set('settings', settings),
};
