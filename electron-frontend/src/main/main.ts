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
import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import MenuBuilder from './menu';
import { resolveHtmlPath, openFile } from './util';
import {
  createSongsStore,
  createQueueItemsStore,
  songFunctions,
  queueItemFunctions,
} from './database';

let mainWindow: BrowserWindow | null = null;

ipcMain.handle('file:read', async (_, filePath: string) => {
  const data = await fs.promises.readFile(filePath, 'utf-8');
  return data;
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

    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
    // custom protocol for reading local files
    protocol.registerFileProtocol('atom', (request, callback) => {
      const url = request.url.substring(7);
      try {
        callback(decodeURI(path.normalize(url)));
      } catch (error) {
        if (error) console.error('Failed to register protocol');
      }
    });
  })
  .then(() => {
    // Database
    const songsStore = createSongsStore();
    const queueItemsStore = createQueueItemsStore();
    const { getSong, setSong, addSong, deleteSong, getAllSongs, setAllSongs } =
      songFunctions;
    const {
      getQueueItem,
      setQueueItem,
      addQueueItem,
      deleteQueueItem,
      getAllQueueItems,
      setAllQueueItems,
    } = queueItemFunctions;

    ipcMain.on('store:getSong', async (event, songId) => {
      event.returnValue = getSong(songsStore, songId);
    });
    ipcMain.on('store:addSong', async (_, song) => {
      addSong(songsStore, song);
    });
    ipcMain.on('store:setSong', async (_, song) => {
      setSong(songsStore, song);
    });
    ipcMain.on('store:deleteSong', async (_, songId) => {
      deleteSong(songsStore, songId);
    });
    ipcMain.on('store:getAllSongs', async (event) => {
      event.returnValue = getAllSongs(songsStore);
    });
    ipcMain.on('store:setAllSongs', async (_, songs) => {
      setAllSongs(songsStore, songs);
    });

    songsStore.onDidChange('songs', (results) =>
      mainWindow?.webContents.send('store:onSongsChange', results)
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
  })
  .catch(console.error);
