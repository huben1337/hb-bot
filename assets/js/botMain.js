
const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { regUser, emailLoginUser, pinLoginUser, joinBedWars, collectRec, findBeds, sendLog, delay, salt, genToken, mainWindow, botApi, ipcMain } = require('./botUtils.js')
let botCount = 0
let botList = {}

function newBot(options) {
    options.onMsaCode = (data) => {
        sendLog(`<li> <img src="./assets/icons/app/code.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(359%) hue-rotate(172deg) brightness(93%) contrast(89%)">[${botName}] First time signing in. Please authenticate now: To sign in, use a web browser to open the page https://www.microsoft.com/link and enter the code: ${data.user_code} to authenticate. </li>`)
    }
    new Hot(options)
}

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

ipcMain.on('API', (event, channel, ...args) => {
    switch (channel) {
        case 'updateBotCount':
            botCount = args[0]
            break
        case 'newBot':
            newBot(args[0])
            break
        case 'config':
            break
        case 'minimize':
            break
        default:
            let commandStr = `botList['${channel}'].${args[0]}(`
            for (let i = 1; i < args.length; i++) {
                commandStr += `'${args[i]}'`
                if (i + 1 === args.length) break
                commandStr += ','
            }
            commandStr += ')'
            console.log(commandStr)
            eval(commandStr)
            break;
    }
})

//master system
let masterInQue = false
let masterCommandInQue = false
let master
let masterToken = genToken()

//bot class
class Hot {
    constructor(options) {
        this.options = options
        this.IndexDepOnVer
        this.scaffoldingBlocks = []
        this.ids = []
        this.usrname = options.username
        this.updatedMapName = true
        this.antiAfkLoaded = false
        this.dontJoinBW = false
        this.cancelBW = false
        this.recCollectionDone = false
        const bot = mineflayer.createBot(options)
        this.bot = bot
        bot.once('login', ()=> {
            this.usrname = bot.username
            botList[`${this.usrname}`] = this
            botApi.emit("login", bot.username)
        })
        bot.once('spawn', ()=> {
            botApi.emit("spawn", bot.username)
            if (bot.version === '1.8.8') {
                this.IndexDepOnVer = 0
                this.scaffoldingBlocks = [35]
                this.ids = [265, 266]
                this.getItemID = (entity) => {
                    return entity.metadata['10'].blockId
                }
            } else {
                this.IndexDepOnVer = 1
                this.scaffoldingBlocks = [157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172]
                this.ids = [728, 732]
                this.getItemID = (entity) => {
                    return entity.metadata['8'].itemId
                }
            }
            bot.loadPlugin(pathfinder)
            const defaultMove = new Movements(bot)
            defaultMove.scafoldingBlocks = this.scaffoldingBlocks
            defaultMove.allowSprinting = false
            defaultMove.canDig = false
            bot.pathfinder.setMovements(defaultMove)
        })
        bot.on('spawn', ()=> {
            sendLog(bot.username, "spawned")
            let inBW = false
            try {
                if(bot.scoreboard['1'].title.toLowerCase().includes('bed wars')) {
                    sendLog(`<strong>${this.usrname} joined Bedwars</strong>`)
                    this.updatedMapName = true
                    inBW = true
                }
            } catch (error) {}
            if (!inBW) {
                this.dontJoinBW = false
                this.updatedMapName = false
            }
        })
        bot.on("teamUpdated", (team)=> {
            if (encodeURIComponent(team['team']) === '%C2%A76%C2%A7r') {
                const teamExtraPre = team['prefix']['json']['extra']
                if (teamExtraPre[`${this.IndexDepOnVer}`]['text'].toLowerCase().includes('map') || team['prefix']['text'].toLowerCase().includes('map')) {
                    if (this.updatedMapName) {
                        let mapname = teamExtraPre[this.IndexDepOnVer]['text']
                        mapname += team['suffix']['json']['text']
                        console.log(mapname)
                        this.currentMap = mapname
                        this.updatedMapName = false
                    } else {
                        this.updatedMapName = true
                    }
                }
            }
        })
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
            this.destruct()
        })
        bot.once('end', async (reason)=> {
            botApi.emit("end", this.usrname, reason)
            const idCheckAutoRc = await getElementState('idCheckAutoRc', this.usrname)
            const joinDelayValue = await getElementValue('idJoinDelay', this.usrname)
            if(idCheckAutoRc === 1) {
                await delay(joinDelayValue ? joinDelayValue : 1000)
                newBot(this.options)
            }
            this.destruct()
        })
        bot.once('error', (err)=> {
            botApi.emit("error", this.usrname, err)
            this.destruct()
        })
        
        bot.on('messagestr', (message) => {
            if(message === 'There should be at least 12 for game to begin!') return
            if (message === 'BedWars') {
                sendLog(`<strong>${this.usrname}'s Game of Bedwars started</strong>`)
            }
            if(botCount <= 2) {
                sendLog(message)
            }
            if(message.includes("/register <email> <email>")) {
                regUser(this.bot , this.usrname)
                return
            }
            if(message.includes("Login with your email address and PIN")) {
                pinLoginUser(this.bot , this.usrname)
                return
            }
            if(message.includes("Login with your PIN.")) {
                bot.chat(`/pin 0212`)
                return
            }
            if(message.includes("Login with your email address. Press")) {
                emailLoginUser(this.bot , this.usrname)
                return
            }
            if(message.includes()) {
                emailLoginUser(this.bot , this.usrname)
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
                masterToken = genToken()
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
                            botApi.emit((this.usrname+command), a1, a2)
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
        })    
    }
    disconnect() {
        this.bot.quit()
    }
    async reconnect() {
        this.disconnect()
        const autoRechecked = await getElementState('idCheckAutoRc', this.usrname)
        if(autoRechecked === 1) return
        const joinDelayValue = (await getElementValue('idJoinDelay', this.usrname))
        await delay(joinDelayValue ? joinDelayValue : 1000)
        newBot(this.options)
    }
    async chat(msg) {
        const idCheckAntiSpam = await getElementState('idCheckAntiSpam', this.usrname)
        if(idCheckAntiSpam === 1) {
            const antiSpamLength = await getElementValue('antiSpamLength', this.usrname)
            this.bot.chat(msg.replaceAll("(SALT)", salt(4))+" "+salt(antiSpamLength ? antiSpamLength : 5))
        } else {
            this.bot.chat(msg.replaceAll("(SALT)", salt(4)))
        }
    }
    useHeld() {
        this.bot.activateItem()
    }
    closeWindow() {
        this.bot.closeWindow(window)
    }
    setHotbar(slot) {
        this.bot.setQuickBarSlot(slot)
    }
    winClick(slot, mode) {
        this.bot.clickWindow(slot, mode, 0)
    }
    look(yaw, pitch) {
        this.bot.look(yaw, (pitch ? pitch: 0))
    }
    sprint(state) {
        this.bot.setControlState('sprint', state)
    }
    antiAfkOn() {
        if(!this.afkLoaded) {
            this.afkLoaded = true
            this.bot.loadPlugin(antiafk)
            this.bot.afk.start()
        } else {
            this.bot.afk.start()
        }
    }
    antiAfkOff() {
        this.bot.afk.stop()
    }
    drop(slot) {
        if(slot) {
            this.bot.clickWindow(slot, 0, 0)
            this.bot.clickWindow(-999, 0, 0)
        } else {
            tossAll()
            async function tossAll() {
                const itemCount = bot.inventory.items().length
                for (var i = 0; i < itemCount; i++) {
                    if (bot.inventory.items().length === 0) return
                    const slot = bot.inventory.items()[0]
                    this.bot.tossStack(slot)
                    await delay(10)
                }
            }
        }
    }
    stopControl(control) {
        this.bot.setControlState(control, false)
    }
    startControl(control) {
        this.bot.setControlState(control, true)
        //if(idCheckSprint.checked === true) {bot.setControlState('sprint', true)} else {bot.setControlState('sprint', false)}
    }
    
    // join bedwars
    joinBedwars(mode) {
        if(this.dontJoinBW) return
        joinBedWars(this, mode)
    }
    cancelJoinBedwars() {
        this.cancelBW = true
        this.dontJoinBW = false
    }

    //collect resources 
    startRecCollection(number) {
        collectRec(this, number)
    }
    stopRecCollection(number) {
        this.recCollectionDone = true
    }

    //remove class object from botList object
    destruct() {
        botList[`${this.usrname}`] = null
    }
    
}