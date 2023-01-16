const { ipcMain } = require("electron")
const mineflayer = require('mineflayer')
const { regUser, emailLoginUser, pinLoginUser, joinBedWars, collectRec, findBeds, sendLog, delay, salt, mainWindow, botApi } = require('./botUtils.js')
//const antiafk = require('antiafk')
let botCount = 0
//master system
let masterInQue = false
let masterCommandInQue = false
let master
let masterToken

ipcMain.on('newBot', (event, options) => {
    newBot(options)
})

ipcMain.on('newMasterToken', (event, newMasterToken) => {
    masterToken = newMasterToken
})

ipcMain.on('updateBotCount', (event, count) => {
    botCount = count
})

async function getElementValue(id, usrname) {
    return new Promise((resolve, reject) => {
        ipcMain.once(usrname+'gotElementValue', (event, reply) => {
            resolve(reply)
        })
        mainWindow.webContents.send('getElementValue', id, usrname)
    })
}

async function getElementState(id, usrname) {
    return new Promise((resolve, reject) => {
        ipcMain.once(usrname+'gotElementState', (event, reply) => {
            resolve(reply)
        })
        mainWindow.webContents.send('getElementState', id, usrname)
    })
}

function newBot(options) {
    let IndexDepOnVer
    let scaffoldingBlocks = []
    let ids = []
    //let joinBW = false
    //pathfinder settings
    let usrname = options.username
    let updatedMapName = true
    const bot = mineflayer.createBot(options)
    bot.once('login', ()=> {
        usrname = bot.username
        botApi.emit("login", bot.username)
        botApi.once(bot.username+'disconnect', () => {bot.quit()})
        botApi.once(bot.username+'reconnect', async () => {
            bot.quit()
            const autoRechecked = await getElementState('idCheckAutoRc', usrname)
            if(autoRechecked === 1) return
            const joinDelayValue = (await getElementValue('idJoinDelay', usrname))
            await delay(joinDelayValue ? joinDelayValue : 1000)
            newBot(options)
        })
        botApi.on(bot.username+'chat', async (o) => {
            const idCheckAntiSpam = await getElementState('idCheckAntiSpam', usrname)
            if(idCheckAntiSpam === 1) {
                const antiSpamLength = await getElementValue('antiSpamLength', usrname)
                bot.chat(o.replaceAll("(SALT)", salt(4))+" "+salt(antiSpamLength ? antiSpamLength : 5))
            } else {
                bot.chat(o.replaceAll("(SALT)", salt(4)))
            }
        })
        botApi.on(bot.username+'useheld', () => {bot.activateItem()})
        botApi.on(bot.username+'closewindow', () => {bot.closeWindow(window)})
        botApi.on(bot.username+'sethotbar', (o) => {bot.setQuickBarSlot(o)})
        botApi.on(bot.username+'winclick', (o, i) => {if(i == 0) {bot.clickWindow(o, 0, 0)} else {bot.clickWindow(o, 1, 0)}})
        botApi.on(bot.username+'stopcontrol', (o) => {bot.setControlState(o, false)})
        botApi.on(bot.username+'look', (o , p) => {bot.look(o, (p ? p: 0))})
        botApi.on(bot.username+'sprintcheck', (o) => {bot.setControlState('sprint', o)})
        botApi.on(bot.username+'startscript', async () => {
            //startScript(bot.username, idScriptPath.files[0].path)
        })
    });
    bot.once('spawn', ()=> {
        botApi.emit("spawn", bot.username)
        if (bot.version === '1.8.8') {
            IndexDepOnVer = 0
            scaffoldingBlocks = [35]
            ids = [265, 266]
            var getItemID = (entity) => {
                return entity.metadata['10'].blockId
            }
        } else {
            IndexDepOnVer = 1
            scaffoldingBlocks = [157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172]
            ids = [728, 732]
            var getItemID = (entity) => {
                return entity.metadata['8'].itemId
            }
        }
        let afkLoaded = false
        botApi.on(bot.username+'afkon', () => {
            if(!afkLoaded) {
                afkLoaded = true
                bot.loadPlugin(antiafk)
                bot.afk.start()
            } else {
                bot.afk.start()
            }
        })
        botApi.on(bot.username+'afkoff', () => {bot.afk.stop()})
    
        botApi.on(bot.username+'drop', (o) => {
            if(o) {
                bot.clickWindow(o, 0, 0)
                bot.clickWindow(-999, 0, 0)
            } else {
                tossAll()
                async function tossAll() {
                    const itemCount = bot.inventory.items().length
                    for (var i = 0; i < itemCount; i++) {
                        if (bot.inventory.items().length === 0) return
                        const item = bot.inventory.items()[0]
                        bot.tossStack(item)
                        await delay(10)
                    }
                }
            }
        })
    
        botApi.on(bot.username+'startcontrol', (o) => {
            bot.setControlState(o, true)
            //if(idCheckSprint.checked === true) {bot.setControlState('sprint', true)} else {bot.setControlState('sprint', false)}
        })
        // join bedwars api and functions setup
        let dontJoinBW = false
        const joinBW = (mode) => {
            joinBedWars(bot, mode, dontJoinBW)
        }
        botApi.on(bot.username+'resetJoinBW', () => {
            dontJoinBW = false
        })
        botApi.on(bot.username+'dontJoinBW', () => {
            dontJoinBW = true
        })
        botApi.on(bot.username+'joinBW', joinBW)
        botApi.on(bot.username+'startRecCollection', (number) => {
            collectRec(bot, number, ids, getItemID)
        })
    
        botApi.once(bot.username+'removeApi', () => {
            console.log('removed api')
            botApi.removeListener('eventName', joinBW)
        })

        /*if(idScriptCheck.checked && idScriptPath.value) { startScript(bot.username, idScriptPath.files[0].path)}
        bot.loadPlugin(pathfinder)
        const defaultMove = new Movements(bot)
        defaultMove.scafoldingBlocks = scaffoldingBlocks
        bot.pathfinder.setMovements(defaultMove)
        */
    });
    bot.on('spawn', ()=> {
        sendLog("spawned")
        let inBW = false
        try {
            if(bot.scoreboard['1'].title.toLowerCase().includes('bed wars')) {
                sendLog(`<strong>${usrname} joined Bedwars</strong>`)
                //updatedMapName = true
                inBW = true
            }
        } catch (error) {}
        if (!inBW) {
            botApi.emit(bot.username+'resetJoinBW')
            updatedMapName = false
        }
    });
    bot.on("teamUpdated", (team)=> {
        /*addPlayers(Object.keys(team['membersMap']))*/
        if (encodeURIComponent(team['team']) === '%C2%A76%C2%A7r') {
            const teamExtraPre = team['prefix']['json']['extra']
            if (teamExtraPre[`${IndexDepOnVer}`]['text'].toLowerCase().includes('map') || team['prefix']['text'].toLowerCase().includes('map')) {
                if (updatedMapName) {
                    let mapname = teamExtraPre[IndexDepOnVer]['text']
                    mapname += team['suffix']['json']['text']
                    console.log(mapname)
                    botApi.emit('mapNamed', mapname)
                    updatedMapName = false
                } else {
                    updatedMapName = true
                }
            }
        }
    });
    bot.once('kicked', (reason)=> {
        try {
            let reason_json = JSON.parse(reason)
            if(reason_json.hasOwnProperty('extra')) {
                reason_json = reason_json['extra']
                reason_text = reason_json.map(item => item.text).join('');
            } else {
                reason_text = reason_json['text'];
            }
            botApi.emit("kicked", bot.username, reason_text)
        } catch {
            botApi.emit("kicked", bot.username, reason)
        } 
    });
    bot.once('end', async (reason)=> {
        botApi.emit("end", usrname, reason)
        const idCheckAutoRc = await getElementState('idCheckAutoRc', usrname)
        const joinDelayValue = await getElementValue('idJoinDelay', usrname)
        if(idCheckAutoRc === true) {
            await delay(joinDelayValue ? joinDelayValue : 1000)
            rmPlayer(usrname)
            newBot(options)
        }
    });
    bot.once('error', (err)=> {
        botApi.emit("error", usrname, err)
    });
    
    bot.on('messagestr', (message) => {
        if(message === 'There should be at least 12 for game to begin!') return
        if (message === 'BedWars') {
            sendLog(`<strong>${usrname}'s Game of Bedwars started</strong>`)
        }
        if(botCount <= 2) {
            sendLog(message)
        }
        if(message.includes("/register <email> <email>")) {
            regUser(bot , usrname)
            return
        }
        if(message.includes("Login with your email address and PIN")) {
            pinLoginUser(bot , usrname)
            return
        }
        if(message.includes("Login with your PIN.")) {
            bot.chat(`/pin 0212`)
            return
        }
        if(message.includes("Login with your email address. Press")) {
            emailLoginUser(bot , usrname)
            return
        }
        if(message.includes()) {
            emailLoginUser(bot , usrname)
            return
        }
        let msg = message.replace(/\s+/g, ' ')
        let i = 0
        if(message.startsWith('[')) {
            msg = msg.split(']')[1]
            i = 2
        }
        msg = msg.split(' ')
        const origin = msg[i]
        if(!masterInQue && message.includes(masterToken)) {
            masterInQue = true
            sendLog(`The Master is now: ${origin}`)
            master = origin
            masterToken = genToken(idMasterToken)
            masterInQue = false
            return
        }
        if(!masterCommandInQue && origin === master) {
            masterCommandInQue = true
            if(msg.length > (i+1)) {
                let a1
                let a2
                const command = msg[i+1]
                if(msg.length > (i+2)) {
                    a1 = msg[i+2].replace(/\;/g, ' ')
                }
                if(msg.length > (i+3)) {
                    a2 = msg[i+3]
                }
                if(command === 'spam') {
                    a2 = a2 ? a2: 1600
                    botApi.emit("spam", a1, a2)
                } else if(command === 'stopspam') {
                    botApi.emit("stopspam")
                } else {
                    if(msg[i-1] === 'From') {
                        botApi.emit((usrname+command), a1, a2)
                    } else {
                        exeAll(command, a1, a2)
                    }
                }
            }
            timeoutMasterCommands()
            async function timeoutMasterCommands() {
                await delay(1000)
                masterCommandInQue = false
                return
            }
        }
    });

}

process.on('uncaughtException', (err) => {sendLog(`<li> <img src="./assets/icons/app/alert-triangle.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(11%) sepia(92%) saturate(6480%) hue-rotate(360deg) brightness(103%) contrast(113%)"> [Internal Error] ${err}</li>`)})