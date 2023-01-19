const { contextBridge, ipcRenderer } = require('electron')
window.getElementById = (id) => {
    return{
        idBotUsername: document.getElementById('botUsename'),
        idIp: document.getElementById('botConnectIp'),
        idBotCount: document.getElementById('botCount'),
        idJoinDelay: document.getElementById('joinDelay'),
        idBtnStart: document.getElementById('btnStart'),
        idBtnStop: document.getElementById('btnStop'),
        idBotList: document.getElementById('botList'),
        idBtnDc: document.getElementById('btnDisconnect'),
        idBtnRc: document.getElementById('btnReconnect'),
        idBtnUse: document.getElementById('btnUseHeld'),
        idBtnClose: document.getElementById('btnCloseWin'),
        idBtnStartScript: document.getElementById('btnStartScript'),
        idBtnChat: document.getElementById('btnChatMessage'),
        idChatMessage: document.getElementById('chatMessage'),
        idSpamMessage: document.getElementById('spamMessageBox'),
        idSpamDelay: document.getElementById('spamDelay'),
        idProxyToggle: document.getElementById('useProxy'),
        idDownbarBotCount: document.getElementById('downbarBotCount'),
        idChatBox: document.getElementById('chatBox'),
        idCheckAutoRc: document.getElementById('checkboxAutoRc'),
        idReconDelay: document.getElementById('reconDelay'),
        idConnectSound: document.getElementById('connectSound'),
        idDiconnectSound: document.getElementById('disconnectSound'),
        idErrorSound: document.getElementById('errorSound'),
        idBtnSpam: document.getElementById('startSpam'),
        idBtnSpamStop: document.getElementById('stopSpam'),
        idUptime: document.getElementById('uptime'),
        idHotbarSlot: document.getElementById('hotbarSlot'),
        idBtnSetHotbar: document.getElementById('btnSetHotbar'),
        idBtnWinClickSlot: document.getElementById('windowValue'),
        idClickWinLoR: document.getElementById('clickWindowLorR'),
        idBtnWinClick: document.getElementById('btnWindowClick'),
        idControlValue: document.getElementById('controlValue'),
        idControlStart: document.getElementById('startControl'),
        idControlStop: document.getElementById('stopControl'),
        idLookValue: document.getElementById('lookValue'),
        idBtnLookAt: document.getElementById('setLook'),
        idCheckSprint: document.getElementById('checkboxSprint'),
        idBtnDrop: document.getElementById('btnDrop'),
        idDropValue: document.getElementById('dropValue'),
        idLinearValue: document.getElementById('linearValue'),
        idScriptPath: document.getElementById('scriptPath'),
        idScriptCheck: document.getElementById('scriptCheck'),
        idAccountFileCheck: document.getElementById('accountFileCheck'),
        idAccountFilePath: document.getElementById('accountFilePath'),
        idBtnM: document.getElementById('btnMinimize'),
        idBtnC: document.getElementById('btnClose'),
        idProxyFilePath: document.getElementById('proxyFilePath'),
        idProxyType: document.getElementById('proxyType'),
        idProxyOrderRnd: document.getElementById('proxyOrderRnd'),
        idCheckAntiSpam: document.getElementById('checkAntiSpam'),
        idAntiAfkLoad: document.getElementById('loadAntiAfk'),
        idStartAfk: document.getElementById('startAfk'),
        idStopAfk: document.getElementById('stopAfk'),
        antiSpamLength: document.getElementById('antiSpamLength'),
        idPartySize: document.getElementById('partySize'),
        idBtnPartyMake: document.getElementById('partyMake'),
        idBtnPartyReset: document.getElementById('partyReset'),
        idAddLeader: document.getElementById('addLeader'),
        idBtnAddLeader: document.getElementById('btnaddLeader'),
        idLeaderList: document.getElementById('leaderList'),
        idMasterToken: document.getElementById('masterToken'),
        idBtnCpToken: document.getElementById('cpToken'),
        idBtnJoinBW: document.getElementById('joinBW'),
        idBtnCancelBW: document.getElementById('cancelBW'),
        idModeBW: document.getElementById('modeBW'),
        idBtnStartRecCollection: document.getElementById('startRecCollection'),
        idBtnStopRecCollection: document.getElementById('stopRecCollection'),
        idRecCount: document.getElementById('recCount')
    }[id]
}

ipcRenderer.on('getElementValue', (event, id, usrname) => {
    const reply = getElementById(id).value
    ipcRenderer.send(usrname+'gotElementValue', reply)
})

ipcRenderer.on('getElementState', (event, id, usrname) => {
    const reply = getElementById(id).checked
    let state = 0
    if(reply) state = 1
    ipcRenderer.send(usrname+'gotElementState', state)
})
/*
window.API = {
    send: (command, ...args) => ipcRenderer.send('API', command, ...args)
}

const { contextBridge, ipcRenderer } = require('electron')
*/
contextBridge.exposeInMainWorld(
  'API',
  {
    send: (command, ...args) => {
        console.log(command, ...args)
        ipcRenderer.send('API', command, ...args)
    },
    on: (command, cb) => {
        ipcRenderer.on(command, (event, ...args) => cb(...args))
    }
  }
)