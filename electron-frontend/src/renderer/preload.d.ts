import { SongProps } from 'components/Song';
import { QueueItemProps } from 'components/SongsQueue';
import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    electron: {
      dialog: {
        openFile(config: Electron.OpenDialogOptions): Promise<string>;
      };
      file: {
        read(filePath: string): Promise<string>;
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
