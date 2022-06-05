/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';
import { dialog } from 'electron';
import { parseFile } from 'music-metadata';
import { spawn } from 'child_process';

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

export const spleeterProcessSong = async (filePath: string) => {
  const outputPath = 'C:\\Users\\YEW WEI QUAN\\Downloads';
  const spleeterProcess = spawn('python', [
    path.join(__dirname, '../python_scripts/spleeter_stems.py'),
    filePath,
    outputPath,
  ]);

  let m = '';

  spleeterProcess.stdout.on('data', (message: any) => {
    console.log(`${message}`);
    m = `${message}`;
  });

  return m;
};
