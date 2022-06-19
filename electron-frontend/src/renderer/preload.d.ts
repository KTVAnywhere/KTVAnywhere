import { IpcRenderer } from 'electron';
import { ConfigType } from 'main/schema';
import { SongProps } from '../components/Song';
import { QueueItemProps } from '../components/SongsQueue';

declare global {
  interface Window {
    electron: {
      dialog: {
        openFile(config: Electron.OpenDialogOptions): Promise<string>;
        openFiles(config: Electron.OpenDialogOptions): Promise<string[]>;
      };
      file: {
        read(filePath: string): Promise<string>;
        readAsBuffer(filePath: string): Promise<Buffer>;
        ifFileExists(filePath: string): boolean;
      };
      music: {
        getLrc(song: SongProps): Promise<{ lyricsPath: string; error?: Error }>;
      };
      store: {
        songs: {
          getSong(songId: string): SongProps;
          setSong(song: SongProps): void;
          addSong(song: SongProps): void;
          addSongs(songs: SongProps[], prepend: boolean): void;
          deleteSong(songId: string): void;
          getAllSongs(): SongProps[];
          setAllSongs(songs: SongProps[]): void;
          onChange(
            callback: (_event: IpcRenderer, results: SongProps[]) => void
          ): () => void;
          search(query: string): Promise<SongProps[]>;
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
          ): () => void;
        };
        config: {
          getPlayingSong(): ConfigType['playingSong'];
          setPlayingSong(playingSong: ConfigType['playingSong']): void;
        };
      };
      preprocess: {
        getSongDetails(
          songPaths: string[]
        ): Promise<{ songName: string; artist: string; songPath: string }[]>;
        spleeterProcessSong(song: SongProps): void;
        spleeterProcessResult(
          callback: (results: {
            vocalsPath: string;
            accompanimentPath: string;
            songId: string;
            error?: Error;
          }) => void
        ): () => void;
      };
    };
  }
}
export {};
