import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { SongProps } from '../components/Song';
import { QueueItemProps } from '../components/SongsQueue';

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
  },
  preprocess: {
    getSongDetails(songPaths: string[]) {
      return ipcRenderer.invoke('preprocess:getSongDetails', songPaths);
    },
  },
});
