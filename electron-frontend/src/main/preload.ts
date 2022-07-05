import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { SongProps } from '../components/Song';
import { QueueItemProps } from '../components/SongsQueue';
import { ConfigType } from './schema';

contextBridge.exposeInMainWorld('electron', {
  dialog: {
    openFile(config: Electron.OpenDialogOptions) {
      return ipcRenderer.invoke('dialog:openFile', config);
    },
    openFiles(config: Electron.OpenDialogOptions) {
      return ipcRenderer.invoke('dialog:openFiles', config);
    },
  },
  file: {
    read(filePath: string) {
      return ipcRenderer.invoke('file:read', filePath);
    },
    readAsBuffer(filePath: string) {
      return ipcRenderer.invoke('file:readAsBuffer', filePath);
    },
    ifFileExists(filePath: string) {
      return ipcRenderer.sendSync('file:ifFileExists', filePath);
    },
    write(filePath: string, data: string) {
      return ipcRenderer.invoke('file:write', filePath, data);
    },
    getWavFileForReverbPath() {
      return ipcRenderer.invoke('file:getWavFileForReverbPath');
    },
  },
  music: {
    getLrc(song: SongProps) {
      return ipcRenderer.invoke('music:getLrc', song);
    },
  },
  store: {
    songs: {
      getSong(songId: string) {
        return ipcRenderer.sendSync('store:getSong', songId);
      },
      setSong(song: SongProps) {
        ipcRenderer.send('store:setSong', song);
      },
      addSong(song: SongProps) {
        ipcRenderer.send('store:addSong', song);
      },
      addSongs(songs: SongProps[], prepend = false) {
        ipcRenderer.send('store:addSongs', songs, prepend);
      },
      deleteSong(songId: string) {
        ipcRenderer.send('store:deleteSong', songId);
      },
      getAllSongs() {
        return ipcRenderer.sendSync('store:getAllSongs');
      },
      setAllSongs(songs: SongProps[]) {
        ipcRenderer.send('store:setAllSongs', songs);
      },
      onChange: (
        callback: (_event: IpcRendererEvent, results: SongProps[]) => void
      ) => {
        ipcRenderer.on('store:onSongsChange', callback);
        return () =>
          ipcRenderer.removeListener('store:onSongsChange', callback);
      },
      search(query: string) {
        return ipcRenderer.invoke('store:searchSongs', query);
      },
    },
    queueItems: {
      getQueueItem(key: string) {
        return ipcRenderer.sendSync('store:getQueueItem', key);
      },
      addQueueItem(queue: QueueItemProps) {
        ipcRenderer.send('store:addQueueItem', queue);
      },
      setQueueItem(queue: QueueItemProps) {
        ipcRenderer.send('store:setQueueItem', queue);
      },
      deleteSong(queueItemId: string) {
        ipcRenderer.send('store:deleteQueueItem', queueItemId);
      },
      getAllQueueItems() {
        return ipcRenderer.sendSync('store:getAllQueueItems');
      },
      setAllQueueItems(queueItems: QueueItemProps[]) {
        ipcRenderer.send('store:setAllQueueItems', queueItems);
      },
      onChange: (
        callback: (_event: IpcRendererEvent, results: QueueItemProps[]) => void
      ) => {
        ipcRenderer.on('store:onQueueItemsChange', callback);
        return () =>
          ipcRenderer.removeListener('store:onQueueItemsChange', callback);
      },
    },
    config: {
      getPlayingSong() {
        return ipcRenderer.sendSync('store:getPlayingSong');
      },
      setPlayingSong(playingSong: ConfigType['playingSong']) {
        ipcRenderer.send('store:setPlayingSong', playingSong);
      },
      getSettings() {
        return ipcRenderer.sendSync('store:getSettings');
      },
      setSettings(settings: ConfigType['settings']) {
        ipcRenderer.send('store:setSettings', settings);
      },
    },
  },
  preprocess: {
    getSongDetails(songPaths: string[]) {
      return ipcRenderer.invoke('preprocess:getSongDetails', songPaths);
    },
    spleeterProcessSong(song: SongProps) {
      ipcRenderer.send('preprocess:spleeterProcessSong', song);
    },
    spleeterProcessResult(
      callback: (results: {
        vocalsPath: string;
        accompanimentPath: string;
        songId: string;
        error?: Error;
      }) => void
    ) {
      ipcRenderer.on('preprocess:spleeterProcessResult', (_event, data) =>
        callback(data)
      );
      return () =>
        ipcRenderer.removeListener(
          'preprocess:spleeterProcessResult',
          (_event, data) => callback(data)
        );
    },
  },
});
