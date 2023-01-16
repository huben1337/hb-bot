//bot connect method
function connectBot() {
    stopBot = false
    if (idAccountFileCheck.checked && idAccountFilePath.value) {
        startAccountFile(idAccountFilePath.files[0].path)
    } else {
        if (idBotCount.value <= 1) {
            newBot(getBotInfo(idBotUsername.value, "0"))
        } else {
            if (idBotUsername.value) {
                startWname()
            } else {
                startWnoName()
            }
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
async function startWname() {
    for (var i = 0; i < idBotCount.value; i++) {
        if (stopBot) break;
        let options = getBotInfo(idBotUsername.value, i)
        if (idBotUsername.value.includes("(SALT)") || idBotUsername.value.includes("(LEGIT)")) {
            newBot(options)
        } else {
            options.username = options.username + "_" + i
            newBot(options)
        }
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
function getBotInfo(botName, n) {
    let unm = "";
    unm = botName.replaceAll("(SALT)", salt(4)).replaceAll("(LEGIT)", genName())
    if (idProxyToggle.checked) {
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
            username: unm ? unm : newUsername(),
            onMsaCode: function(data) {
                sendLog(`<li> <img src="./assets/icons/app/code.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(359%) hue-rotate(172deg) brightness(93%) contrast(89%)">[${botName}] First time signing in. Please authenticate now: To sign in, use a web browser to open the page https://www.microsoft.com/link and enter the code: ${data.user_code} to authenticate. </li>`)
            }
        };
        return options;
    } else {
        options = {
            host: idIp.value.split(':')[0] ? idIp.value.split(':')[0] : "herobrine.org",
            port: idIp.value.split(':')[1] ? idIp.value.split(':')[1] : 25565,
            username: unm ? unm : newUsername(),
            //version: '1.8.8',
            onMsaCode: function(data) {
                sendLog(`<li> <img src="./assets/icons/app/code.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(359%) hue-rotate(172deg) brightness(93%) contrast(89%)">[${botName}] First time signing in. Please authenticate now: To sign in, use a web browser to open the page https://www.microsoft.com/link and enter the code: ${data.user_code} to authenticate. </li>`)
            }
        };

        return options;
    }
}

//random char
function salt(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

//delay function
function delay(ms) {
    return new Promise(res => setTimeout(res, ms))
}