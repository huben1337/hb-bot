const { ipcRenderer, shell } = require("electron")
const https = require('https')
const { connectBot, delay, salt, addPlayer, rmPlayer, errBot, botApi, sendLog, exeAll, startScript, mineflayer } = require( __dirname + '/assets/js/cf.js')
const antiafk = require( __dirname +  '/assets/plugins/antiafk')
const fs = require('fs');
const { spawn } = require('child_process');
const { parseJson } = require("builder-util-runtime");
const scriptPath = (__dirname + '\\hb-alt-gen_bots.ps1');
process.NODE_TLS_REJECT_UNAUTHORIZED = "0"
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

//button listeners

window.addEventListener('DOMContentLoaded', () => {
    botApi.setMaxListeners(0)
    idBtnStart.addEventListener('click', () => {connectBot(); saveData()})
    idBtnStop.addEventListener('click', () => {botApi.emit('stopBots')})
    idBtnDc.addEventListener('click', () => {exeAll("disconnect")})
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
    idBtnC.addEventListener('click', () => {saveData(); window.close()})
    idBtnM.addEventListener('click', () => {ipcRenderer.send('minimize')})
})
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
                reject(error);
            });
        });
    });
}

async function regUser(bot , username) {
    commands = [username]
    while(true) {
        try {
            var email = JSON.parse(await httpsGet('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1'))
            if(email) {
                break
            }
        } catch (error) {
            sendLog('error1')
            await delay(1000)
        }
    }
    const emailSplit = email.toString().split('@')
    bot.chat(`/register ${email} ${email}`)
    commands.push(email)
    while(true) {
        await delay(1000)
        try {
            var messages = JSON.parse(await httpsGet(`https://www.1secmail.com/api/v1/?action=getMessages&login=${emailSplit[0]}&domain=${emailSplit[1]}`))
            var message = messages.find((message) => message.from.split('@')[1] === 'mc.herobrine.org')
            if(message) {
                const code = message.subject.split()[0];
                bot.chat(`/code ${code}`)
                commands.push(code)
                break
            }
        } catch (error) {
            sendLog('error2')
        }
    }
    /*
    const powershell = spawn('powershell.exe', ["-File" , scriptPath]);
    commands = [username]
    powershell.stdout.on('data', (data) => {
        command = data.toString()
        console.log(command);
        bot.chat(command)
        commands.push(command)
    });
    
    powershell.stderr.on('data', (data) => {
        sendLog(data.toString());
    });
    
    powershell.on('exit', (code) => {
        sendLog(`Child exited with code ${code}`);
    });
    */
    bot.on('messagestr', (message) => {
        if(message.includes("/pin <pin> <pin>")) {
            bot.chat("/pin 0212 0212")
        }
        if(message.includes("Account now registered with")) {
            commands.push('0212')
            const data = (commands.toString('\n').replace(/,\n/g , '') + '\n')
            fs.writeFile('bots_reg.csv', data , { flag: 'a' }, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
            });
            /*
            let contents = fs.readFileSync('accounts.json', 'utf8')
            const lines = contents.split('\n')
            lines.pop()
            lines.pop()
            contents = lines.join('\n')
            const new_fdp_account = ('\n  },\n  {\n' + '    "name": "'+ username +'",\n' + '    "type": "me.liuli.elixir.account.CrackedAccount"' + '\n  }\n]')
            const fdp_accounts = (contents + new_fdp_account)
            fs.writeFile("..\\..\\..\\accounts.json", fdp_accounts , { flag: 'w' }, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
            });
            */
        }
    });
}
function newBot(options) {
    const bot = mineflayer.createBot(options)
    let afkLoaded = false

    bot.once('login', ()=> {
        botApi.emit("login", bot.username)
    });
    bot.once('spawn', ()=> {
        botApi.emit("spawn", bot.username)
        if(idScriptCheck.checked && idScriptPath.value) { startScript(bot.username, idScriptPath.files[0].path)}
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
        botApi.emit("end", options.username, reason)
        if(idCheckAutoRc.checked === true) {
            recon()
            async function recon() {
                await delay(idReconDelay.value)
                newBot(options)
            }
        }
    });
    bot.once('error', (err)=> {
        botApi.emit("error", options.username, err)
    });
    
    bot.on('messagestr', (message) => {
        if(idBotList.getElementsByTagName("li").length <= 1) {
            sendLog(message)
        }
        if(message.includes("/register <email> <email>")) {
            regUser(bot , options.username).then()
        }
    });

    botApi.once(options.username+'disconnect', () => {bot.quit()})
    botApi.once(options.username+'reconnect', () => {newBot(options)})
    botApi.on(options.username+'useheld', () => {bot.activateItem()})
    botApi.on(options.username+'closewindow', () => {bot.closeWindow(window)})
    botApi.on(options.username+'chat', (o) => { if(idCheckAntiSpam.checked) { bot.chat(o.replaceAll("(SALT)", salt(4))+" "+salt(antiSpamLength.value ? antiSpamLength.value : 5)) } else { bot.chat(o.replaceAll("(SALT)", salt(4))) } })
    botApi.on(options.username+'sethotbar', (o) => {bot.setQuickBarSlot(o)})
    botApi.on(options.username+'winclick', (o, i) => {if(i == 0) {bot.clickWindow(o, 0, 0)} else {bot.clickWindow(o, 1, 0)}})
    botApi.on(options.username+'stopcontrol', (o) => {bot.setControlState(o, false)})
    botApi.on(options.username+'look', (o) => {bot.look(o, 0)})
    botApi.on(options.username+'sprintcheck', (o) => {bot.setControlState('sprint', o)})
    botApi.on(options.username+'startscript', () => {startScript(bot.username, idScriptPath.files[0].path)})
    
    botApi.on(options.username+'afkon', () => {
        if(!afkLoaded) {
            afkLoaded = true
            bot.loadPlugin(antiafk)
            bot.afk.start()
        } else {
            bot.afk.start()
        }
    })
    botApi.on(options.username+'afkoff', () => {bot.afk.stop()})

    botApi.on(options.username+'drop', (o) => {
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

    botApi.on(options.username+'startcontrol', (o) => {
        bot.setControlState(o, true)
        if(idCheckSprint.checked === true) {bot.setControlState('sprint', true)} else {bot.setControlState('sprint', false)}
    })

    idBtnRc.addEventListener('click', () => {botApi.emit(options.username+'reconnect')})
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

process.on('uncaughtException', (err) => {sendLog(`<li> <img src="./assets/icons/app/alert-triangle.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(11%) sepia(92%) saturate(6480%) hue-rotate(360deg) brightness(103%) contrast(113%)"> [Internal Error] ${err}</li>`)})