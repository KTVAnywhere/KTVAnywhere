
const { BrowserWindow, app } = require('electron');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 800
    })

    win.loadFile("mainWindow.html")
}

app.whenReady().then(() => {
    createWindow();
});