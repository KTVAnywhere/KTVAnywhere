const dialog = {
  showOpenDialog: jest
    .fn()
    .mockReturnValue({ filePaths: ['C:\\folder\\file.mp3'] }),
};

const electron = jest.requireActual('electron');

electron.dialog = dialog;

module.exports = electron;
