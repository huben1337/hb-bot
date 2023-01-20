const { app, ipcMain, BrowserWindow} = require('electron')
const Window = require('./assets/js/window')
const Store = require('electron-store')
const store = new Store()
let mainWindow

app.disableHardwareAcceleration()
app.whenReady().then(async () => {
    createWindow()
    app.focus()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
    app.on('window-all-closed', () => { return })
})

function createWindow() {
    mainWindow = new Window({
        file: "index.html"
    })
    module.exports = { app, mainWindow }
    ipcMain.on('minimize', () => {
        mainWindow.minimize()
    })
    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send('restore', store.get('config'))
        mainWindow.webContents.send('restoreTheme', store.get('theme'))
        require('./assets/js/botMain')
    })
    mainWindow.once('closed', () => {
        mainWindow = null
    })
}

ipcMain.on('API', (event, command, ...args) => {
    switch (command) {
        case 'config':
            store.set('config', args[0])
            break

        case 'theme':
            store.set('theme', path)
            break
    
        default:
            break
    }
})

ipcMain.handleOnce('saveAccData', async (event) => {
    if (!stringList) return
    return new Promise(async (resolve, reject) => {
        const data = stringList.join('');
        fs.writeFile(dataPath + '\\bots_reg.csv', data , { flag: 'a' }, (error) => {
            if (error) {
                reject(error)
                return
            }
            resolve
        })
    })
})