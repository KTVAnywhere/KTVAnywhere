import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { SongProps } from '../components/SongItem';
import { QueueItemProps } from '../components/SongsQueue';

export type Channels = 'ipc-example';
export type FileChannels = 'readSend' | 'readReceive';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, data: string) {
      ipcRenderer.send(channel, data);
    },
    once(channel: Channels, func: (data: string) => void) {
      ipcRenderer.once(channel, (_event, data) => func(data));
    },
  },
  dialog: {
    openFile(config: Electron.OpenDialogOptions) {
      return ipcRenderer.invoke('dialog:openFile', config);
    },
  },
  file: {
    readSend(filePath: string) {
      ipcRenderer.send('file:readSend', filePath);
    },
    readReceive: (
      callback: (err: NodeJS.ErrnoException | null, results: string) => void
    ) =>
      ipcRenderer.once('file:readReceive', (_event, err, data) =>
        callback(err, data)
      ),
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
      ) => ipcRenderer.on('store:onSongsChange', callback),
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
      ) => ipcRenderer.on('store:onQueueItemsChange', callback),
    },
  },
});
