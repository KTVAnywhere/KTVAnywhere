/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs-extra';
import Fuse from 'fuse.js';
import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import { spawn } from 'child_process';
import MenuBuilder from './menu';
import {
  resolveHtmlPath,
  openFiles,
  openFile,
  writeFile,
  processSongDetails,
  getLrcFile,
} from './util';
import {
  createSongsStore,
  createQueueItemsStore,
  songFunctions,
  queueItemFunctions,
  createConfigStore,
  configFunctions,
} from './database';
import { SongProps } from '../components/Song';

let mainWindow: BrowserWindow | null = null;

ipcMain.handle('file:read', async (_, filePath: string) => {
  const data = await fs.promises.readFile(filePath, 'utf-8');
  return data;
});

ipcMain.handle('file:readAsBuffer', async (_, filePath: string) => {
  const data = await fs.promises.readFile(filePath, null);
  return data;
});

ipcMain.on('file:ifFileExists', (event, filePath) => {
  event.returnValue = fs.existsSync(filePath);
});

ipcMain.handle('file:write', async (_, filePath: string, data: string) => {
  const result = await writeFile(filePath, data);
  return result;
});

ipcMain.on('file:getWavFileForReverbPath', async (event) => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  event.returnValue = getAssetPath('impulses_impulse_rev.wav');
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 1024,
    minHeight: 728,
    autoHideMenuBar: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    ipcMain.handle('dialog:openFile', (_, config) => openFile(config));
    ipcMain.handle('dialog:openFiles', (_, config) => openFiles(config));
    ipcMain.handle('preprocess:getSongDetails', async (_, songPaths) =>
      processSongDetails(songPaths)
    );
    ipcMain.on('preprocess:processSong', async (event, song) => {
      try {
        const songFolder = path.join(
          app.getPath('userData'),
          'songs',
          song.songId
        );
        if (!fs.existsSync(songFolder)) {
          fs.mkdirSync(songFolder, { recursive: true });
        }
        const spleeterPath = app.isPackaged
          ? path.join(process.resourcesPath, 'assets', 'process_song')
          : path.join(__dirname, '../python_scripts/process_song.py');

        const spleeterProcess = app.isPackaged
          ? spawn(spleeterPath, [song.songPath, songFolder, song.songId])
          : spawn('python', [
              spleeterPath,
              song.songPath,
              songFolder,
              song.songId,
            ]);

        spleeterProcess?.stdout.on('data', (message: string) => {
          if (`${message}` === `done processing ${song.songId}`) {
            mainWindow?.webContents.send('preprocess:processResult', {
              vocalsPath: path.join(songFolder, 'vocals.mp3'),
              accompanimentPath: path.join(songFolder, 'accompaniment.mp3'),
              graphPath: path.join(songFolder, 'graph.json'),
              songId: song.songId,
            });
          } else if (`${message}` === 'ffmpeg binary not found') {
            mainWindow?.webContents.send('preprocess:processResult', {
              vocalsPath: '',
              accompanimentPath: '',
              graphPath: '',
              songId: song.songId,
              error: new Error(
                'Failed to run spleeter: ffmpeg binary not found'
              ),
            });
          } else if (`${message}` === 'input file does not exist') {
            mainWindow?.webContents.send('preprocess:processResult', {
              vocalsPath: '',
              accompanimentPath: '',
              graphPath: '',
              songId: song.songId,
              error: new Error(
                `Failed to run spleeter: ${song.songPath} does not exist`
              ),
            });
          } else if (`${message}` === 'generic error message') {
            mainWindow?.webContents.send('preprocess:processResult', {
              vocalsPath: '',
              accompanimentPath: '',
              graphPath: '',
              songId: song.songId,
              error: new Error('Failed to run spleeter'),
            });
          }
        });

        spleeterProcess.once('close', () => {
          spleeterProcess.removeAllListeners();
        });
      } catch (error) {
        event.reply('preprocess:processResult', {
          vocalsPath: '',
          accompanimentPath: '',
          graphPath: '',
          songId: song.songId,
          error: error as Error,
        });
      }
    });
    // custom protocol for reading local files
    protocol.registerFileProtocol('atom', (request, callback) => {
      const url = request.url.substring(7);
      try {
        return callback({ path: decodeURI(path.normalize(url)) });
      } catch (error) {
        console.error('Failed to register protocol');
      }
      return false;
    });
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .then(() => {
    ipcMain.handle('music:getLrc', (_, song) => getLrcFile(song));
  })
  .then(() => {
    // Database
    const songsStore = createSongsStore();
    const queueItemsStore = createQueueItemsStore();
    const configStore = createConfigStore();
    const {
      getSong,
      setSong,
      addSong,
      addSongs,
      deleteSong,
      getAllSongs,
      setAllSongs,
    } = songFunctions;
    const {
      getQueueItem,
      setQueueItem,
      addQueueItem,
      deleteQueueItem,
      getAllQueueItems,
      setAllQueueItems,
    } = queueItemFunctions;
    const {
      getAudioStatusConfig,
      setAudioStatusConfig,
      getSettings,
      setSettings,
    } = configFunctions;
    const fuseOptions = {
      keys: ['songName', 'artist'],
      findAllMatches: true,
      shouldSort: true,
      threshold: 0.4,
      ignoreLocation: true,
    };
    const indexPath = path.join(app.getPath('userData'), 'songIndex.json');
    let songSearcher: Fuse<SongProps>;
    const saveSongIndex = () => {
      fs.promises.writeFile(
        indexPath,
        JSON.stringify(songSearcher.getIndex().toJSON())
      );
    };
    try {
      const songs = getAllSongs(songsStore);
      const index = fs.readFileSync(indexPath);
      const songsIndex = Fuse.parseIndex<SongProps>(index);
      songSearcher = new Fuse(songs, fuseOptions, songsIndex);
    } catch {
      const songs = getAllSongs(songsStore);
      songSearcher = new Fuse(songs, fuseOptions);
    }

    ipcMain.on('store:getSong', async (event, songId) => {
      event.returnValue = getSong(songsStore, songId);
    });
    ipcMain.on('store:addSong', async (_, song) => {
      addSong(songsStore, songSearcher, song);
      saveSongIndex();
    });
    ipcMain.on('store:addSongs', async (_, songs, prepend) => {
      addSongs(songsStore, songs, songSearcher, prepend);
      saveSongIndex();
    });
    ipcMain.on('store:setSong', async (_, song) => {
      setSong(songsStore, songSearcher, song);
      saveSongIndex();
    });
    ipcMain.on('store:deleteSong', async (_, songId) => {
      deleteSong(songsStore, songSearcher, songId);
      saveSongIndex();
    });
    ipcMain.on('store:getAllSongs', async (event) => {
      event.returnValue = getAllSongs(songsStore);
    });
    ipcMain.on('store:setAllSongs', async (_, songs) => {
      setAllSongs(songsStore, songSearcher, songs);
      saveSongIndex();
    });

    songsStore.onDidChange('songs', (results) =>
      mainWindow?.webContents.send('store:onSongsChange', results)
    );

    ipcMain.handle('store:searchSongs', (_, query) =>
      songSearcher.search(query).map((result) => result.item)
    );

    ipcMain.on('store:getQueueItem', async (event, queueItemId) => {
      event.returnValue = getQueueItem(queueItemsStore, queueItemId);
    });
    ipcMain.on('store:setQueueItem', async (_, queueItem) => {
      setQueueItem(queueItemsStore, queueItem);
    });
    ipcMain.on('store:addQueueItem', async (_, queueItem) => {
      addQueueItem(queueItemsStore, queueItem);
    });
    ipcMain.on('store:deleteQueueItem', async (_, queueItemId) => {
      deleteQueueItem(queueItemsStore, queueItemId);
    });

    ipcMain.on('store:getAllQueueItems', async (event) => {
      event.returnValue = getAllQueueItems(queueItemsStore);
    });

    ipcMain.on('store:setAllQueueItems', async (_, queueItems) => {
      setAllQueueItems(queueItemsStore, queueItems);
    });

    queueItemsStore.onDidChange('queueItems', (results) =>
      mainWindow?.webContents.send('store:onQueueItemsChange', results)
    );

    ipcMain.on('store:getAudioStatusConfig', (event) => {
      event.returnValue = getAudioStatusConfig(configStore);
    });

    ipcMain.on('store:setAudioStatusConfig', (_, audioStatusConfig) => {
      setAudioStatusConfig(configStore, audioStatusConfig);
    });

    ipcMain.on('store:getSettings', (event) => {
      event.returnValue = getSettings(configStore);
    });

    ipcMain.on('store:setSettings', (_, settings) => {
      setSettings(configStore, settings);
    });
  })
  .catch(console.error);
