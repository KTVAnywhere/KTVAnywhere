import { SongProps } from 'components/SongItem';
import { QueueItemProps } from 'components/SongsQueue';
import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
      dialog: {
        openFile(config: Electron.OpenDialogOptions): Promise<string>;
      };
      store: {
        songs: {
          getSong(songId: string): SongProps;
          setSong(song: SongProps): void;
          deleteSong(song: SongProps): void;
          getAllSongs(): SongProps[];
          setAllSongs(songs: SongProps[]): void;
        };
        queueItems: { getAllQueueItems(): QueueItemProps[] };
      };
    };
  }
}
export {};
