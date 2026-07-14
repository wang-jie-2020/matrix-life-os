const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(app.getPath('userData'), 'alo-data.json');
const TEMP_FILE = DATA_FILE + '.tmp';
const PACKAGE_JSON = path.join(__dirname, '../package.json');

function readFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Failed to read/parse ${filePath}:`, error);
  }
  return null;
}

function readData() {
  return readFileSafe(DATA_FILE);
}

function writeData(data) {
  const json = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(TEMP_FILE, json, 'utf-8');
    fs.renameSync(TEMP_FILE, DATA_FILE);
    return true;
  } catch (error) {
    console.error('Failed to write data file:', error);
    try {
      if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    } catch {
      // Ignore cleanup error.
    }
    return false;
  }
}

ipcMain.handle('save-data', (_event, data) => writeData(data));

ipcMain.on('load-data-sync', (event) => {
  event.returnValue = readData();
});

ipcMain.on('get-app-version', (event) => {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    event.returnValue = pkg.version || '0.0.0';
  } catch {
    event.returnValue = '0.0.0';
  }
});

let mainWindow = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Matrix Life OS',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.replace('app://', '');
    const filePath = path.normalize(`${__dirname}/../dist/${url}`);
    callback(filePath);
  });
  createWindow();
});

app.on('before-quit', async (event) => {
  if (!isQuitting && mainWindow && !mainWindow.isDestroyed()) {
    isQuitting = true;
    event.preventDefault();

    try {
      mainWindow.webContents.send('app-before-quit');
    } catch (error) {
      console.error('Failed to send before-quit to renderer:', error);
    }

    setTimeout(() => {
      app.quit();
    }, 500);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
