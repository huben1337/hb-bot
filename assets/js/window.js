const { BrowserWindow } = require('electron')
const path = require('path')
class Window extends BrowserWindow {
  constructor ({ file }) {
    super({
      width: 930,
      height: 530,
      autoHideMenuBar: true,
      show: false,
      resizable: false,
      devTools: false,
      titleBarStyle: 'hidden',
      webPreferences: {
      //contextIsolation: false,
      //nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
      }
    })
    this.loadFile(file)
    this.webContents.openDevTools()
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

module.exports = Window