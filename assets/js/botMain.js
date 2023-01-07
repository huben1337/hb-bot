const { ipcRenderer, shell, clipboard} = require("electron")
const https = require('https')
const { connectBot, delay, salt, addPlayer, rmPlayer, errBot, botApi, sendLog, exeAll, makeParty, addLeader, resetParty, startScript, mineflayer } = require( __dirname + '/assets/js/cf.js')
var v = require('vec3');
const antiafk = require( __dirname +  '/assets/plugins/antiafk')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
const fs = require('fs');
let currentTime = Date.now()
let accData = []

//master system
let masterInQue = false
let masterCommandInQue = false
let master
let masterToken

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

//button listeners
window.addEventListener('DOMContentLoaded', () => {
    botApi.setMaxListeners(0)
    idBtnStart.addEventListener('click', () => {connectBot(); saveData()})
    idBtnStop.addEventListener('click', () => {botApi.emit('stopBots')})
    idBtnDc.addEventListener('click', () => {exeAll("disconnect")})
    idBtnRc.addEventListener('click', () => {exeAll("reconnect")})
    idBtnUse.addEventListener('click', () => {exeAll("useheld")})
    idBtnClose.addEventListener('click', () => {exeAll("closewindow")})
    idBtnSpam.addEventListener('click', () => {botApi.emit("spam", idSpamMessage.value, idSpamDelay.value)})
    idBtnSpamStop.addEventListener('click', () => {botApi.emit("stopspam")})
    idBtnChat.addEventListener('click', () => {exeAll("chat", idChatMessage.value)})
    idBtnSetHotbar.addEventListener('click', () => {exeAll("sethotbar", idHotbarSlot.value)})
    idBtnWinClick.addEventListener('click', () => {exeAll("winclick", idBtnWinClickSlot.value, idClickWinLoR.value)})
    idControlStart.addEventListener('click', () => {exeAll("startcontrol", idControlValue.value)})
    idControlStop.addEventListener('click', () => {exeAll("stopcontrol", idControlValue.value)})
    idBtnLookAt.addEventListener('click', () => {exeAll("look", idLookValue.value)})
    idCheckSprint.addEventListener('click', () => {exeAll("sprintcheck", idCheckSprint.checked)})
    idBtnDrop.addEventListener('click', () => {exeAll("drop", idDropValue.value)})
    idBtnStartScript.addEventListener('click', () => {exeAll('startscript')})
    idStartAfk.addEventListener('click', () => {exeAll('afkon')})
    idStopAfk.addEventListener('click', () => {exeAll('afkoff')})
    idBtnAddLeader.addEventListener('click', () => {addLeader(idAddLeader.value)})
    idBtnPartyMake.addEventListener('click', () => {makeParty(idPartySize.value)})
    idBtnPartyReset.addEventListener('click', () => {resetParty()})
    idBtnC.addEventListener('click', () => {saveData(); saveAccData(accData);})
    idBtnM.addEventListener('click', () => {ipcRenderer.send('minimize')})
    idBtnCpToken.addEventListener('click', () => {clipboard.writeText(masterToken)})
})

genToken()

let oldLogins
readCsv()
async function readCsv() {
    const dataPath = await ipcRenderer.invoke('location')
    fs.readFile(dataPath + '\\bots_reg.csv', (error, data) => {
        if (error) {
        console.log(error);
        return;
        }
        const rows = data.toString().split('\n')
        oldLogins = rows
    });
}
//email setup
async function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let chunks_of_data = [];

            response.on('data', (fragments) => {
                chunks_of_data.push(fragments);
            });

            response.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                resolve(response_body.toString());
            });

            response.on('error', (error) => {
                sendLog(`httpsGet() failed with error ${error}`)
                reject(error);
            });
        });
    });
}

async function checkMail(emailSplit) {
    while(true) {
        await delay(1000)
        try {
            const messages = JSON.parse(await httpsGet(`https://www.1secmail.com/api/v1/?action=getMessages&login=${emailSplit[0]}&domain=${emailSplit[1]}`))
            const message = messages.filter((item) => item['from'].split('@')[1] === 'mc.herobrine.org');
            const code = message['0']['subject'].split(' ')[0]
            if(message) {
                return code
            }
        } catch (error) {
            //nothing for now
        }
    }
}

async function regUser(bot , usrname) {
    let email
    let commands = [usrname]
    sendLog(`Registering ${usrname}.`)
    while(true) {
        try {
            email = JSON.parse(await httpsGet('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1'))
            if(email) {
                break
            }
        } catch (error) {
            sendLog(error)
            await delay(1000)
        }
    }
    const emailSplit = email.toString().split('@')
    bot.chat(`/register ${email} ${email}`)
    commands.push(email)
    const code = (await checkMail(emailSplit))
    bot.chat(`/code ${code}`)
    commands.push(code)

    bot.on('messagestr', (message) => {
        if(message.includes("/pin <pin> <pin>")) {
            bot.chat("/pin 0212 0212")
        }
        if(message.includes("Account now registered with")) {
            commands.push('0212')
            const data = (commands.toString('\n').replace(/,\n/g , '') + '\n')
            accData.push(data)
        }
    });
}

async function emailLoginUser(bot, usrname) {
    const unm = usrname.replaceAll('.' , '')
    sendLog(`Logging in ${unm} with email.`)
    try {
        const list = oldLogins.filter(inner => inner.includes(unm))
        const email = list.toString().split(',')[1]
        const emailSplit = email.split('@')
        bot.chat(`/login ${email}`)
        const code = (await checkMail(emailSplit))
        bot.chat(`/code ${code}`)
        bot.on('messagestr', (message) => {
            if(message.includes("You have verified your login.")) {
                bot.chat("/pin 0212 0212")
            }
        });
    } catch (error) {
        bot.quit()
    }
}

async function pinLoginUser(bot, usrname) {
    const unm = usrname.replaceAll('.' , '')
    sendLog(`Logging in ${unm} with pin.`)
    try {
        const list = oldLogins.filter(inner => inner.includes(unm))
        const email = list.toString().split(',')[1]
        bot.chat(`/login ${email} 0212`)
    } catch (error) {
        bot.quit()
    }
}

function addControlls(options, bot) {
    botApi.once(bot.username+'disconnect', () => {bot.quit()})
    botApi.once(bot.username+'reconnect', () => {bot.quit(); const r = async () => {await delay(500); newBot(options)}; r()})
    botApi.on(bot.username+'chat', (o) => { if(idCheckAntiSpam.checked) { bot.chat(o.replaceAll("(SALT)", salt(4))+" "+salt(antiSpamLength.value ? antiSpamLength.value : 5)) } else { bot.chat(o.replaceAll("(SALT)", salt(4))) } })
    botApi.on(bot.username+'useheld', () => {bot.activateItem()})
    botApi.on(bot.username+'closewindow', () => {bot.closeWindow(window)})
    botApi.on(bot.username+'sethotbar', (o) => {bot.setQuickBarSlot(o)})
    botApi.on(bot.username+'winclick', (o, i) => {if(i == 0) {bot.clickWindow(o, 0, 0)} else {bot.clickWindow(o, 1, 0)}})
    botApi.on(bot.username+'stopcontrol', (o) => {bot.setControlState(o, false)})
    botApi.on(bot.username+'look', (o , p) => {bot.look(o, (p ? p: 0))})
    botApi.on(bot.username+'sprintcheck', (o) => {bot.setControlState('sprint', o)})
    botApi.on(bot.username+'startscript', () => {startScript(bot.username, idScriptPath.files[0].path)})
    
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
        if(idCheckSprint.checked === true) {bot.setControlState('sprint', true)} else {bot.setControlState('sprint', false)}
    })

    botApi.on(bot.username+'block', () => {
        let block = bot.blockAt(bot.entity.position);
        console.log(block)
    })
}

async function goGen(bot) {
    bot.once("itemDrop", (entity) => {
        if (entity.metadata[8].itemId === 728) {
            const p = entity.position
            bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 0.5))
            return
        }
        goGen(bot)
    });
}

async function checkBed(d, basePos, t, skip) {
    let x = basePos[d]['x']
    let y = basePos[d]['y']
    let z = basePos[d]['z']
    let dl = 200
    await delay(50)
    if(bot.blockAt(basePos[d])) {
        skip = true
        dl = 50
        const pos = bot.findBlocks({point: basePos[d], matching: (block) => block.name.includes('bed')})[0]
        if(pos) {
            const botlist = Object.keys(bot.players)
            for (let j = 0; j < botlist.length; j++) {
                botApi.emit(botlist[j]+'foundbed', d, pos)
            }
            return
        }
    }
    if (!skip) {
        bot.world.once(`blockUpdate:(${x}, ${y}, ${z})`, () => {
        checkBed(d, basePos, t, false)
        })
    }
    await delay(dl)
    if(t < 5000) {
        t += dl
        checkBed(d, basePos, t, true)
    }
}

async function findBeds(bot) {
    let basePos = {}
    let bedsPos = {}
    botApi.on(bot.username+'foundbed', (d, pos) => {
        bedsPos[d] = pos
        console.log(bedsPos[d])
    })
    basePos.N = v(0, 66, -64)
    basePos.E = v(64, 66, 0)
    basePos.S = v(0, 66, 64)
    basePos.W = v(-64, 66, 0)
    const directions = Object.keys(basePos)
    for (let i = 0; i < directions.length; i++) {
        let d = directions[i]
        if (!bedsPos[d]) {
            checkBed(d, basePos, 0, false)
        }
    }
}

function newBot(options) {
    //pathfinder settings
    let usrname = options.username
    bot = mineflayer.createBot(options)
    let afkLoaded = false

    bot.once('login', ()=> {
        botApi.emit("login", bot.username)
        addControlls(options, bot)
        usrname = bot.username
    });
    bot.once('spawn', ()=> {
        botApi.emit("spawn", bot.username)
        if(idScriptCheck.checked && idScriptPath.value) { startScript(bot.username, idScriptPath.files[0].path)}
        bot.loadPlugin(pathfinder)
        const defaultMove = new Movements(bot)
        defaultMove.scafoldingBlocks.push([157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172])
        bot.pathfinder.setMovements(defaultMove)
    });
    bot.on('spawn', ()=> {
        if(bot.scoreboard['1'].title.toLowerCase() === 'bed wars') {
            findBeds(bot)
            goGen(bot)
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
    bot.once('end', (reason)=> {
        botApi.emit("end", usrname, reason)
        if(idCheckAutoRc.checked === true) {
            recon()
            async function recon() {
                await delay(idReconDelay.value ? idReconDelay.value : 1000)
                rmPlayer(usrname)
                newBot(options)
            }
        }
    });
    bot.once('error', (err)=> {
        botApi.emit("error", usrname, err)
    });
    
    bot.on('messagestr', (message) => {
        if(message === 'There should be at least 12 for game to begin!') return
        if(idBotList.getElementsByTagName("li").length <= 2) {
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
            genToken()
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

botApi.on('spam', (msg, dl) => {
    botApi.on('stopspam', ()=> {clearInterval(chatSpam)})
    var chatSpam = setInterval(() => {
        exeAll("chat", msg)
    }, dl);
})

botApi.on("login", (name)=> {
    addPlayer(name)
    sendLog(`<li> <img src="./assets/icons/app/arrow-right.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(68%) sepia(74%) saturate(5439%) hue-rotate(86deg) brightness(128%) contrast(114%)"> ${name} Logged in.</li>`)
})
botApi.on("spawn", (name)=> {
    sendLog(`<li> <img src="./assets/icons/app/arrow-right.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(26%) sepia(94%) saturate(5963%) hue-rotate(74deg) brightness(96%) contrast(101%)"> ${name} Spawned.</li>`)
})
botApi.on("kicked", (name, reason)=> {
    rmPlayer(name)
    sendLog(`<li> <img src="./assets/icons/app/arrow-left.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(11%) sepia(92%) saturate(6480%) hue-rotate(360deg) brightness(103%) contrast(113%)"> [${name}] : ${reason}</li>`)
})
botApi.on("end", (name, reason)=> {
    rmPlayer(name)
    sendLog(`<li> <img src="./assets/icons/app/alert-triangle.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(100%) sepia(61%) saturate(4355%) hue-rotate(357deg) brightness(104%) contrast(104%)"> [${name}] ${reason}</li>`)
})
botApi.on("error", (name, err)=> {
    errBot(name)
    sendLog(`<li> <img src="./assets/icons/app/alert-triangle.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(89%) sepia(82%) saturate(799%) hue-rotate(1deg) brightness(103%) contrast(102%)"> [${name}] ${err}</li>`)
})

//token for master
function genToken() {
    masterToken = salt(20)
    idMasterToken.innerHTML = masterToken
}

// uptime counter
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
function getTime(from) {
    const calc = Date.now() - from
    return convertTime((calc / 1000).toFixed())
}
function convertTime(number) {
    return `${formatTime(Math.floor(number / 60))}:${formatTime(number % 60)}`;
}
function formatTime(time) {
    if (10 > time) return "0" + time;
    return time;
}

// save and restore config
ipcRenderer.on('restore', (event, data) => {
    Object.keys(data).forEach(v => {
        document.getElementById(v).value = data[v]
      });
})

function saveData() {
    ipcRenderer.send('config', (event, {
        "botUsename": document.getElementById('botUsename').value,
        "botConnectIp": document.getElementById('botConnectIp').value,
        "botCount": document.getElementById('botCount').value,
        "joinDelay": document.getElementById('joinDelay').value,
    }))
}
let savedAccData = false
async function saveAccData(stringList) {
    if(!savedAccData) {
        savedAccData = true
        const dataPath = await ipcRenderer.invoke('location')
        const data = stringList.join('');
        fs.writeFile(dataPath + '\\bots_reg.csv', data , { flag: 'a' }, (err) => {
            if (err) {
                sendLog(error);
                return;
            }
        });
        window.close()
    }
}
process.on('uncaughtException', (err) => {sendLog(`<li> <img src="./assets/icons/app/alert-triangle.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(11%) sepia(92%) saturate(6480%) hue-rotate(360deg) brightness(103%) contrast(113%)"> [Internal Error] ${err}</li>`)})