// const { clipboard } = require("electron")
import { connectBot, addPlayer, rmPlayer, sendLog, exeAll, makeParty, addLeader, resetParty, getTime, saveConfig, stopConnecting, spam }  from "./appUtils.js"
let currentTime = Date.now()
//ids
let idBotUsername = document.getElementById('botUsename')
let idIp = document.getElementById('botConnectIp')
let idBotCount = document.getElementById('botCount')
let idJoinDelay = document.getElementById('joinDelay')
let idBtnStart = document.getElementById('btnStart')
let idBtnStop = document.getElementById('btnStop')
let idBotList = document.getElementById('botList')
let idBtnDc = document.getElementById('btnDisconnect')
let idBtnRc = document.getElementById('btnReconnect')
let idBtnUse = document.getElementById('btnUseHeld')
let idBtnClose = document.getElementById('btnCloseWin')
let idBtnStartScript = document.getElementById('btnStartScript')
let idBtnChat = document.getElementById('btnChatMessage')
let idChatMessage = document.getElementById('chatMessage')
let idSpamMessage = document.getElementById('spamMessageBox')
let idSpamDelay = document.getElementById('spamDelay')
let idProxyToggle = document.getElementById('useProxy')
let idDownbarBotCount = document.getElementById('downbarBotCount')
let idChatBox = document.getElementById('chatBox')
let idCheckAutoRc = document.getElementById('checkboxAutoRc')
let idReconDelay = document.getElementById('reconDelay')
let idConnectSound = document.getElementById('connectSound')
let idDiconnectSound = document.getElementById('disconnectSound')
let idErrorSound = document.getElementById('errorSound')
let idBtnSpam = document.getElementById('startSpam')
let idBtnSpamStop = document.getElementById('stopSpam')
let idUptime = document.getElementById('uptime')
let idHotbarSlot = document.getElementById('hotbarSlot')
let idBtnSetHotbar = document.getElementById('btnSetHotbar')
let idBtnWinClickSlot = document.getElementById('windowValue')
let idClickWinLoR = document.getElementById('clickWindowLorR')
let idBtnWinClick = document.getElementById('btnWindowClick')
let idControlValue = document.getElementById('controlValue')
let idControlStart = document.getElementById('startControl')
let idControlStop = document.getElementById('stopControl')
let idLookValue = document.getElementById('lookValue')
let idBtnLookAt = document.getElementById('setLook')
let idCheckSprint = document.getElementById('checkboxSprint')
let idBtnDrop = document.getElementById('btnDrop')
let idDropValue = document.getElementById('dropValue')
let idLinearValue = document.getElementById('linearValue')
let idScriptPath = document.getElementById('scriptPath')
let idScriptCheck = document.getElementById('scriptCheck')
let idAccountFileCheck = document.getElementById('accountFileCheck')
let idAccountFilePath = document.getElementById('accountFilePath')
let idBtnM = document.getElementById('btnMinimize')
let idBtnC = document.getElementById('btnClose')
let idProxyFilePath = document.getElementById('proxyFilePath')
let idProxyType = document.getElementById('proxyType')
let idProxyOrderRnd = document.getElementById('proxyOrderRnd')
let idCheckAntiSpam = document.getElementById('checkAntiSpam')
let idAntiAfkLoad = document.getElementById('loadAntiAfk')
let idStartAfk = document.getElementById('startAfk')
let idStopAfk = document.getElementById('stopAfk')
let antiSpamLength = document.getElementById('antiSpamLength')
let idPartySize = document.getElementById('partySize')
let idBtnPartyMake = document.getElementById('partyMake')
let idBtnPartyReset = document.getElementById('partyReset')
let idAddLeader = document.getElementById('addLeader')
let idBtnAddLeader = document.getElementById('btnaddLeader')
let idLeaderList = document.getElementById('leaderList')
let idMasterToken = document.getElementById('masterToken')
let idBtnCpToken = document.getElementById('cpToken')
let idBtnJoinBW = document.getElementById('joinBW')
let idBtnCancelBW = document.getElementById('cancelBW')
let idModeBW = document.getElementById('modeBW')
let idBtnStartRecCollection = document.getElementById('startRecCollection')
let idBtnStopRecCollection = document.getElementById('stopRecCollection')
let idRecCount = document.getElementById('recCount')

//button listeners
window.addEventListener('DOMContentLoaded', () => {
    //appApi.setMaxListeners(0)
    idBtnStart.addEventListener('click', () => {connectBot(); saveConfig()})
    idBtnStop.addEventListener('click', () => {stopConnecting()})
    idBtnDc.addEventListener('click', () => {exeAll("disconnect")})
    idBtnRc.addEventListener('click', () => {exeAll("reconnect")})
    idBtnUse.addEventListener('click', () => {exeAll("useheld")})
    idBtnClose.addEventListener('click', () => {exeAll("closewindow")})
    idBtnSpam.addEventListener('click', () => {spam.start()})
    idBtnSpamStop.addEventListener('click', () => {spam.stop()})
    idBtnChat.addEventListener('click', () => {exeAll("chat", idChatMessage.value)})
    idBtnSetHotbar.addEventListener('click', () => {exeAll("sethotbar", idHotbarSlot.value)})
    idBtnWinClick.addEventListener('click', () => {exeAll("winclick", idBtnWinClickSlot.value, idClickWinLoR.value)})
    idControlStart.addEventListener('click', () => {exeAll("startControl", idControlValue.value)})
    idControlStop.addEventListener('click', () => {exeAll("stopControl", idControlValue.value)})
    idBtnLookAt.addEventListener('click', () => {exeAll("look", idLookValue.value)})
    idCheckSprint.addEventListener('click', () => {exeAll("sprintcheck", idCheckSprint.checked)})
    idBtnDrop.addEventListener('click', () => {exeAll("drop", idDropValue.value)})
    idBtnStartScript.addEventListener('click', () => {exeAll('startscript')})
    idStartAfk.addEventListener('click', () => {exeAll('afkon')})
    idStopAfk.addEventListener('click', () => {exeAll('afkoff')})
    idBtnAddLeader.addEventListener('click', () => {addLeader(idAddLeader.value)})
    idBtnPartyMake.addEventListener('click', () => {makeParty(idPartySize.value)})
    idBtnPartyReset.addEventListener('click', () => {resetParty()})
    idBtnC.addEventListener('click', () => {saveConfig(); window.close()})
    idBtnM.addEventListener('click', () => {API.send('minimize')})
    idBtnCpToken.addEventListener('click', () => {navigator.clipboard.writeText(idMasterToken.innerHTML)})
    idBtnJoinBW.addEventListener('click', () => {exeAll('joinBedwars', idModeBW.value)})
    idBtnCancelBW.addEventListener('click', () => {exeAll('cancelJoinBedwars', undefined, undefined)})
    idBtnStartRecCollection.addEventListener('click', () => {exeAll('startRecCollection', idRecCount.value)})
    idBtnStopRecCollection.addEventListener('click', () => {exeAll('stopRecCollection')})
})

//restore app

API.on('restore', (data) => {
    Object.keys(data).forEach(v => {
        document.getElementById(v).value = data[v]
    });
})

API.on('newMasterToken', (masterToken) => {
    idMasterToken.innerHTML = masterToken
})

API.on('sendLog', (msg) => {
    sendLog(msg)
})

API.on('rmPlayer', (name) => {
    rmPlayer(name)
})

API.on('addPlayer', (name) => {
    addPlayer(name)
})

//uptime counter
idBtnStart.addEventListener('click', () => {
    idBtnStart.addEventListener('click', () => {
        currentTime = Date.now()
        clearInterval(botUptime)
        idUptime.innerHTML = getTime(currentTime)
    })
    
let botUptime = setInterval(() => {
    idUptime.innerHTML = getTime(currentTime)
}, 1000);
})