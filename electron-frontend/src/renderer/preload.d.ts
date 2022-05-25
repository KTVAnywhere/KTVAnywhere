import { SongProps } from 'components/SongItem';
import { QueueItemProps } from 'components/SongsQueue';
import { Channels } from 'main/preload';
import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, data: string): void;
        once(channel: string, func: (data: string) => void): void;
      };
      dialog: {
        openFile(config: Electron.OpenDialogOptions): Promise<string>;
      };
      file: {
        readSend(filePath: string): void;
        readReceive(
          callback: (err: NodeJS.ErrnoException | null, results: string) => void
        ): void;
      };
      store: {
        songs: {
          getSong(songId: string): SongProps;
          setSong(song: SongProps): void;
          addSong(song: SongProps): void;
          deleteSong(songId: string): void;
          getAllSongs(): SongProps[];
          setAllSongs(songs: SongProps[]): void;
          onChange(
            callback: (_event: IpcRenderer, results: SongProps[]) => void
          ): IpcRenderer;
        };
        queueItems: {
          getQueueItem(queueItemId: string): QueueItemProps;
          setQueueItem(queueItem: QueueItemProps): void;
          addQueueItem(queueItem: QueueItemProps): void;
          deleteQueueItem(queueItemId: string): void;
          getAllQueueItems(): QueueItemProps[];
          setAllQueueItems(queueItems: QueueItemProps[]): void;
          onChange(
            callback: (_event: IpcRenderer, results: QueueItemProps[]) => void
          ): IpcRenderer;
        };
      };
    };
  }
}
export {};
