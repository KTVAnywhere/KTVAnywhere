/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';
import { dialog, app } from 'electron';
import { parseFile } from 'music-metadata';
import NeteaseMusic from 'simple-netease-cloud-music';
import { SongProps } from 'components/Song';
import fs from 'fs-extra';

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

export const openFiles = async (config: Electron.OpenDialogOptions) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(config);
  if (!canceled) {
    return filePaths;
  }
  throw new Error('Cancelled file selection');
};

export const openFile = async (config: Electron.OpenDialogOptions) => {
  const filePaths = await openFiles(config);
  return filePaths[0];
};

export const processSongDetails = async (songPaths: string[]) => {
  const items = await Promise.all(
    songPaths.map(async (songPath) => {
      try {
        const { common } = await parseFile(songPath);
        return {
          songName: common.title,
          artist: common.artist,
          songPath,
        };
      } catch (error) {
        console.log(`${songPath} is not an audio file`);
        return null;
      }
    })
  );
  return items.filter((x) => x) as {
    songName: string;
    artist: string;
    songPath: string;
  }[];
};

export const findNeteaseSongId = async (
  netease: NeteaseMusic,
  songName: string,
  artist?: string
) => {
  const searchKey = artist ? `${songName} ${artist}` : songName;
  const results = await netease.search(searchKey, undefined, 1);
  if (results.result.songs) {
    const neteaseSongId = results.result.songs[0].id;
    return neteaseSongId;
  }
  throw Error(`Could not find song with ${searchKey}`);
};

export const findLyric = async (
  netease: NeteaseMusic,
  neteaseSongId: string
) => {
  const results = await netease.lyric(neteaseSongId);
  const lyrics = results.lrc.lyric;
  if (lyrics) {
    return lyrics;
  }
  throw Error('No lyrics for the song was found');
};

export const getLrcFile = async (song: SongProps) => {
  const netease = new NeteaseMusic();
  try {
    const lyricsPath = await findNeteaseSongId(
      netease,
      song.songName,
      song.artist
    )
      .then((neteaseSongId) => findLyric(netease, neteaseSongId))
      .then((lyric) => {
        const songFolder = path.join(
          app.getPath('userData'),
          'songs',
          song.songId
        );
        if (!fs.existsSync(songFolder)) {
          fs.mkdirSync(songFolder, { recursive: true });
        }
        const lyricsFile = path.join(songFolder, 'lyrics.lrc');
        fs.promises.writeFile(lyricsFile, lyric);
        return lyricsFile;
      });
    return { lyricsPath };
  } catch (error) {
    return { lyricsPath: '', error: error as Error };
  }
};
