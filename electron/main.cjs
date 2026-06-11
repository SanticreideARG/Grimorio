// main.cjs — Proceso principal de Electron para Grimorio.
// Usa .cjs explícitamente porque package.json declara "type":"module" (ESM)
// pero el main de Electron debe ser CommonJS.

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    title: 'GRIMORIO',
    autoHideMenuBar: true,
    backgroundColor: '#0a0603',
  });

  // En producción carga el index.html del build de Vite.
  // __dirname apunta a /resources/app.asar/electron/ → sube un nivel al dist/.
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
