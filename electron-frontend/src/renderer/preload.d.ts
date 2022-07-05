import { NoteEventTime } from '@spotify/basic-pitch/types';
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
        write(filePath: string, data: string): Promise<{ error?: Error }>;
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
          getSettings(): ConfigType['settings'];
          setSettings(settings: ConfigType['settings']): void;
        };
      };
      preprocess: {
        getSongDetails(
          songPaths: string[]
        ): Promise<{ songName: string; artist: string; songPath: string }[]>;
        processSong(song: SongProps): void;
        processResult(
          callback: (results: {
            vocalsPath: string;
            accompanimentPath: string;
            graphPath: string;
            songId: string;
            error?: Error;
          }) => void
        ): () => void;
        basicPitchProcessSong(
          callback: (
            song: SongProps,
            vocalsPath: string,
            accompanimentPath: string
          ) => void
        ): () => void;
        basicPitchProcessResult(
          song: SongProps,
          vocalsPath: string,
          accompanimentPath: string,
          result: { noteEvents: NoteEventTime[]; error?: Error }
        ): void;
      };
    };
  }
}
export {};
