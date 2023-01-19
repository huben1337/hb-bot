const { app, ipcMain, BrowserWindow} = require('electron')
const Window = require('./assets/js/window')
const Store = require('electron-store')
const store = new Store()
const fs = require('fs')
const dataPath = app.getPath("userData")
let mainWindow
let oldLogins

app.disableHardwareAcceleration()
app.whenReady().then(async () => {
    if(!oldLogins) {
        try {
            const data = fs.readFileSync(dataPath + '\\bots_reg.csv')
            const rows = data.toString().split('\n')
            oldLogins = rows
        } catch (error) {
            console.error(error)
            oldLogins = []
        }
    }
    createWindow()
    app.focus()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

function createWindow() {
    mainWindow = new Window({
        file: "index.html"
    })
    module.exports = { oldLogins, mainWindow }
    ipcMain.on('minimize', () => {
        mainWindow.minimize()
    });
    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send('restore', store.get('config'))
        mainWindow.webContents.send('restoreTheme', store.get('theme'))
        require('./assets/js/botMain')
    });
}

ipcMain.on('API', (event, command, ...args) => {
    switch (command) {
        case 'config':
            store.set('config', args[0])
            break;

        case 'theme':
            store.set('theme', path)
            break;
    
        default:
            break;
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