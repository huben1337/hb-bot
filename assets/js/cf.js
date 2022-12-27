const mineflayer = require('mineflayer');
const { EventEmitter } = require('events')
const socks = require('socks').SocksClient
const ProxyAgent = require('proxy-agent')
const botApi = new EventEmitter()
const fetch = require('node-fetch')
const fs = require('fs')
const { spawn } = require('child_process');
const scriptPath = '.\\hb-alt-gen_bots.ps1';
let stopBot = false

//bot connect method
function connectBot() {
    stopBot = false
    if (idAccountFileCheck.checked && idAccountFilePath.value) {
        startAccountFile(idAccountFilePath.files[0].path)
    } else {
        if (idBotCount.value <= 1) {
            newBot(getBotInfo(idBotUsername.value, "0"))
        } else {
            startWnoName()
        }
    }
}

//bot stop event listener
botApi.on('stopBots', () => {stopBot = true})

//connection methods
async function startAccountFile(accountFile) {
    sendLog(`<li> <img src="./assets/icons/app/code.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(359%) hue-rotate(172deg) brightness(93%) contrast(89%)"> Account File Loaded. </li>`)
    const file = fs.readFileSync(accountFile)
    const lines = file.toString().split(/\r?\n/)
    const count = idBotCount.value ? idBotCount.value : lines.length
    for (var i = 0; i < count; i++) {
        newBot(getBotInfo(lines[i], i))
        await delay(idJoinDelay.value ? idJoinDelay.value : 1000)
    }
}

async function startWnoName() {
    for (var i = 0; i < idBotCount.value; i++) {
        if (stopBot) break;
        newBot(getBotInfo(idBotUsername.value, i))
        await delay(idJoinDelay.value ? idJoinDelay.value : 1000)
    }
}

//send bot info
function getBotInfo(unm, n) {
    //proxy
    if (idProxyToggle.checked) {
        //open proxy file
        const file = fs.readFileSync(idProxyFilePath.files[0].path)
        const lines = file.toString().split(/\r?\n/)
        const rnd = Math.floor(Math.random() * lines.length)
        let proxyHost = '';
        let proxyPort = '';

        //setting up proxy parameters
        if (idProxyOrderRnd.checked) {
            proxyHost = lines[rnd].split(":")[0]
            proxyPort = lines[rnd].split(":")[1]
        } else {
            if (n >= lines.length) {
                n = rnd
            }
            proxyHost = lines[n].split(":")[0]
            proxyPort = lines[n].split(":")[1]
        }

        options = {
            connect: client => {
                socks.createConnection({
                    proxy: {
                        host: proxyHost,
                        port: parseInt(proxyPort),
                        type: parseInt(idProxyType.value)
                    },
                    command: 'connect',
                    destination: {
                        host: idIp.value.split(':')[0],
                        port: parseInt(idIp.value.split(':')[1] ? idIp.value.split(':')[1] : 25565)
                    }
                }, (err, info) => {
                    if (err) {
                        sendLog(`[ProxyError]-> [${unm}]-> [proxy:port]-> ${err}`)
                        return;
                    }
                    client.setSocket(info.socket);
                    client.emit('connect')
                })
            },
            agent: new ProxyAgent({
                protocol: `socks${idProxyType.value}`,
                host: proxyHost,
                port: proxyPort
            }),
            host: idIp.value.split(':')[0] ? idIp.value.split(':')[0] : "herobrine.org",
            port: idIp.value.split(':')[1] ? idIp.value.split(':')[1] : 25565,
            username: unm ? unm : newUsername()
        };
        return options;
    } else {
        options = {
            host: idIp.value.split(':')[0] ? idIp.value.split(':')[0] : "herobrine.org",
            port: idIp.value.split(':')[1] ? idIp.value.split(':')[1] : 25565,
            username: unm ? unm : newUsername()
        };
        return options;
    }
}
//new username
function  newUsername() {
    min = Math.ceil(5)
    max = Math.floor(16)
    var length = Math.floor(Math.random() * (max - min + 1)) + min
    const characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
    let name = ''
    const charactersLength = characters.length
    for ( let i = 0; i < length; i++ ) {
        name += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    console.log(name)
    return name
}
//register new User
function regUser(bot , username) {
    const powershell = spawn('powershell.exe', [scriptPath]);
    commands = [username]
    powershell.stdout.on('data', (data) => {
        command = data.toString()
        console.log(command);
        bot.chat(command)
        commands.push(command)
    });
    
    powershell.stderr.on('data', (data) => {
        console.error(data.toString());
    });
    
    powershell.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });
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
            let contents = fs.readFileSync('accounts.json', 'utf8')
            const lines = contents.split('\n')
            lines.pop()
            lines.pop()
            contents = lines.join('\n')
            const new_fdp_account = ('\n  },\n  {\n' + '    "name": "'+ username +'",\n' + '    "type": "me.liuli.elixir.account.CrackedAccount"' + '\n  }\n]')
            const fdp_accounts = (contents + new_fdp_account)
            fs.writeFile("accounts.json", fdp_accounts , { flag: 'w' }, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
            });
        }
    });
}
//random char
function salt(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

//delay function
function delay(ms) {
    return new Promise(res => setTimeout(res, ms))
};

//add players to player list
function addPlayer(name) {
    const b = document.createElement("li")
    b.id = "list" + name
    b.innerHTML = name
    b.addEventListener('click', () => {
        selectBot(event)
    })
    idBotList.appendChild(b)
    idBotList.scrollTop = idBotList.scrollHeight
    updateBotCount()
}

//remove player from list
function rmPlayer(name) {
    if (document.getElementById("list" + name)) document.getElementById("list" + name).remove()
    updateBotCount()
}

//log error
function errBot(name) {
    rmPlayer(name)
    updateBotCount()
}

//console logs
function sendLog(log) {
    const b = document.createElement("li")
    b.innerHTML = log
    idChatBox.appendChild(b)
    idChatBox.scrollTop = idChatBox.scrollHeight
}

//execute command all bots
function exeAll(command, a1, a2) {
    let e = idBotList.getElementsByTagName("li")
    if (e.length === 0) return;
    let l = e.length
    let list = ["BLANK"]

    for (var i = 0; i < l; i++) {
        if (i + 1 === l) {
            startcmd(a1, a2)
        }
        if (e[i].classList.value.includes("botSelected")) {
            list.push(e[i].innerHTML + command)
        }
    }

    async function startcmd(a1, a2) {
        for (var i = 0; i < list.length; i++) {
            botApi.emit(list[i], a1, a2)
            await delay(idLinearValue.value)
        }
    }
    sendLog(`<li> <img src="./assets/icons/app/code.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(359%) hue-rotate(172deg) brightness(93%) contrast(89%)"> [${command}] ${a1? a1: ""} ${a2 ? a2: ""} </li>`)
}

function updateBotCount() {
    idDownbarBotCount.innerHTML = idBotList.getElementsByTagName("li").length
}

//script controler
async function startScript(botId, script) {
    sendLog(`<li> <img src="./assets/icons/app/code.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(359%) hue-rotate(172deg) brightness(93%) contrast(89%)"> [${botId}] Script started. </li>`)
    const file = fs.readFileSync(script)
    const lines = file.toString().split(/\r?\n/)

    for (var i = 0; i < lines.length; i++) {
        const args = lines[i].split(" ")
        const command = args.shift().toLowerCase();
        if (command === "delay") {
            await delay(args.shift())
        } else if (command === "chat") {
            botApi.emit(botId + command, lines[i].slice(5))
        } else {
            botApi.emit(botId + command, args.shift(), args.shift(1))
        }
    }
}

module.exports = { getBotInfo, connectBot, regUser, salt, delay, addPlayer, rmPlayer, errBot, sendLog, exeAll, startScript, loadTheme, mineflayer, botApi }