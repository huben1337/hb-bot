/*
const socks = require('socks').SocksClient
const ProxyAgent = require('proxy-agent')
const fs = require('fs')
*/
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

let stopBot = false

function stopConnecting() {
    stopBot = true
}
console.log(window.docElements)
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
        if (stopBot) break
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
        if (stopBot) break
        newBot(getBotInfo(idBotUsername.value, i))
        await delay(idJoinDelay.value ? idJoinDelay.value : 1000)
    }
}

//send bot info
function getBotInfo(botName, n) {
    let unm = ""
    unm = botName.toString().replaceAll("(SALT)", salt(4)).replaceAll("(LEGIT)", genName())
    if (idProxyToggle.checked) {
        const file = fs.readFileSync(idProxyFilePath.files[0].path)
        const lines = file.toString().split(/\r?\n/)
        const rnd = Math.floor(Math.random() * lines.length)
        let proxyHost = ''
        let proxyPort = ''

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

        const options = {
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
                        return
                    }
                    client.setSocket(info.socket)
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
        }
        return options
    } else {
        const options = {
            host: idIp.value.split(':')[0] ? idIp.value.split(':')[0] : "herobrine.org",
            port: idIp.value.split(':')[1] ? idIp.value.split(':')[1] : 25565,
            username: unm ? unm : newUsername(),
            version: '1.8.8',
        }

        return options
    }
}

//random char
function salt(length) {
    var result = ''
    var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

//delay function
function delay(ms) {
    return new Promise(res => setTimeout(res, ms))
}

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
    if(idScriptCheck.checked && idScriptPath.value) { startScript(name, idScriptPath.files[0].path)}
    updateBotCount()
}

//remove player from list
function rmPlayer(name) {
    const botInList = document.getElementById("list" + name)
    if (botInList) botInList.remove()
    //API.send(name+'removeApi')
    updateBotCount()
}

//console logs
function sendLog(log) {
    const b = document.createElement("li")
    b.innerHTML = log
    idChatBox.appendChild(b)
    idChatBox.scrollTop = idChatBox.scrollHeight
}

function listBots() {
    const botList = idBotList.getElementsByTagName("li")
    const len = botList.length
    if (len === 0) return
    let list = []

    for (var i = 0; i < len; i++) {
        if (botList[i].classList.value.includes("botSelected")) {
            list.push(botList[i].innerHTML)
        }
    }
    return list  
}

//execute command all bots
function exeAll(command, a1, a2) {
    const list = listBots()
    if(!list) return
    startcmd(a1, a2)
    async function startcmd(a1, a2) {
        for (var i = 0; i < list.length; i++) {
            console.log(list[i])
            API.send(list[i], command, a1, a2)
            if(command === 'reconnect') {
                await delay(idJoinDelay.value ? idJoinDelay.value : 1000)
            } else {
                await delay(idLinearValue.value)
            }
        }
    }
    sendLog(`<li> <img src="./assets/icons/app/code.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(359%) hue-rotate(172deg) brightness(93%) contrast(89%)"> [${command}] ${a1? a1: ""} ${a2 ? a2: ""} </li>`)
}

function listLeaders() {
    const leaderList = idLeaderList.getElementsByTagName("li") 
    const len = leaderList.length
    let leaders = []
    for (var i = 0; i < len; i++) {
        leaders.push(leaderList[i].innerHTML)  
    }
    return leaders
}

function addLeader(name) {
    if(name === '') return
    const b = document.createElement("li")
    sendLog(`Adding to ${name}'s party`)
    b.id = "plist" + name
    b.innerHTML = name
    idLeaderList.appendChild(b)
    idLeaderList.scrollTop = idLeaderList.scrollHeight
}

function resetParty() {
    const leaderList = listLeaders()
    if (leaderList.length === 0) return
    for(var i = 0; i < leaderList.length; i++) {
        if (document.getElementById("plist" + leaderList[i])) document.getElementById("plist" + leaderList[i]).remove()
        API.send((leaderList[i] + 'chat'), '/party leave')
    }
}

function makeParty(size) {
    var leaderList = listLeaders()
    var list = listBots()
    let leader
    const s = size ? size: 4
    let j = s
    startcmd()
    async function startcmd() {
        for (var i = 0; i < list.length; i++) {
            if(i == (list.length - 1) && !(leaderList.length == 1)) return
            if(j == s) {
                if(leaderList.length > 0) {
                    leader = leaderList.pop()
                } else {
                    leader = list.pop()
                }
                addLeader(leader)
                j = 1
            }
            const invmsg = `/party invite ${list[i]}`
            const acptmsg = `/party accept ${leader}`
            API.send((leader + 'chat'), invmsg)
            sendLog(invmsg)
            await delay(1000)
            API.send((list[i] + 'chat'), acptmsg)
            sendLog(acptmsg)
            await delay(600)
            await delay(idLinearValue.value)
            j += 1
        }
    }
}

function updateBotCount() {
    const count = idBotList.getElementsByTagName("li").length
    idDownbarBotCount.innerHTML = count
    API.send('updateBotCount', (count))

}

//script controler
async function startScript(botId, script) {
    sendLog(`<li> <img src="./assets/icons/app/code.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(359%) hue-rotate(172deg) brightness(93%) contrast(89%)"> [${botId}] Script started. </li>`)
    const file = fs.readFileSync(script)
    const lines = file.toString().split(/\r?\n/)

    for (var i = 0; i < lines.length; i++) {
        const args = lines[i].split(" ")
        const command = args.shift().toLowerCase()
        if (command === "delay") {
            await delay(args.shift())
        } else if (command === "chat") {
            API.send(botId + command, lines[i].slice(5))
        } else {
            API.send(botId + command, args.shift(), args.shift(1))
        }
    }
}

// name generator
function genName() {
    let name = ''
    const words = ["Ace", "Aid", "Aim", "Air", "Ale", "Arm", "Art", "Awl", "Eel", "Ear", "Era", "Ice", "Ire", "Ilk", "Oar", "Oak", "Oat", "Oil", "Ore", "Owl", "Urn", "Web", "Cab", "Dab", "Jab", "Lab", "Tab", "Dad", "Fad", "Lad", "Mad", "Bag", "Gag", "Hag", "Lag", "Mag", "Rag", "Tag", "Pal", "Cam", "Dam", "Fam", "Ham", "Jam", "Ram", "Ban", "Can", "Fan", "Man", "Pan", "Tan", "Bap", "Cap", "Lap", "Pap", "Rap", "Sap", "Tap", "Yap", "Bar", "Car", "Jar", "Tar", "War", "Bat", "Cat", "Hat", "Mat", "Pat", "Tat", "Rat", "Vat", "Caw", "Jaw", "Law", "Maw", "Paw", "Bay", "Cay", "Day", "Hay", "Ray", "Pay", "Way", "Max", "Sax", "Tax", "Pea", "Sea", "Tea", "Bed", "Med", "Leg", "Peg", "Bee", "Lee", "Tee", "Gem", "Bet", "Jet", "Net", "Pet", "Set", "Den", "Hen", "Men", "Pen", "Ten", "Yen", "Dew", "Mew", "Pew", "Bib", "Fib", "Jib", "Rib", "Sib", "Bid", "Kid", "Lid", "Vid", "Tie", "Lie", "Pie", "Fig", "Jig", "Pig", "Rig", "Wig", "Dim", "Bin", "Din", "Fin", "Gin", "Pin", "Sin", "Tin", "Win", "Yin", "Dip", "Lip", "Pip", "Sip", "Tip", "Git", "Hit", "Kit", "Pit", "Wit", "Bod", "Cod", "God", "Mod", "Pod", "Rod", "Doe", "Foe", "Hoe", "Roe", "Toe", "Bog", "Cog", "Dog", "Fog", "Hog", "Jog", "Log", "Poi", "Con", "Son", "Ton", "Zoo", "Cop", "Hop", "Mop", "Pop", "Top", "Bot", "Cot", "Dot", "Lot", "Pot", "Tot", "Bow", "Cow", "Sow", "Row", "Box", "Lox", "Pox", "Boy", "Soy", "Toy", "Cub", "Nub", "Pub", "Sub", "Tub", "Bug", "Hug", "Jug", "Mug", "Rug", "Tug", "Bum", "Gum", "Hum", "Rum", "Tum", "Bun", "Gun", "Pun", "Run", "Sun", "Cup", "Pup", "Cut", "Gut", "Hut", "Nut", "Rut", "Egg", "Ego", "Elf", "Elm", "Emu", "End", "Era", "Eve", "Eye", "Ink", "Inn", "Ion", "Ivy", "Lye", "Dye", "Rye", "Pus", "Gym", "Her", "His", "Him", "Our", "You", "She", "Add", "Ail", "Are", "Eat", "Err", "Oil", "Use", "Nab", "Jab", "Bag", "Lag", "Nag", "Rag", "Sag", "Tag", "Wag", "Jam", "Ram", "Ran", "Tan", "Cap", "Lap", "Nap", "Rap", "Sap", "Tap", "Yap", "Mar", "Has", "Was", "Pat", "Sat", "Lay", "Pay", "Say", "Max", "Tax", "Fed", "See", "Get", "Let", "Net", "Met", "Pet", "Set", "Wet", "Mew", "Sew", "Lie", "Tie", "Bog", "Jog", "Boo", "Coo", "Moo", "Bop", "Hop", "Lop", "Mop", "Pop", "Top", "Sop", "Bow", "Mow", "Row", "Tow", "Dub", "Rub", "Dug", "Lug", "Tug", "Hum", "Sup", "Buy", "Got", "Jot", "Rot", "Nod", "Hem", "Led", "Wed", "Fib", "Jib", "Rib", "Did", "Dig", "Jig", "Rig", "Dip", "Nip", "Sip", "Rip", "Zip", "Gin", "Win", "Bit", "Hit", "Sit", "Won", "Pry", "Try", "Cry", "All", "Fab", "Bad", "Had", "Mad", "Rad", "Tad", "Far", "Fat", "Raw", "Lax", "Max", "Gay", "Big", "Dim", "Fit", "Red", "Wet", "Old", "New", "Hot", "Coy", "Fun", "Ill", "Odd", "Shy", "Dry", "Wry", "And", "But", "Yet", "For", "Nor", "The", "Not", "How", "Too", "Yet", "Now", "Off", "Any", "Out", "Bam", "Nah", "Yea", "Yep", "Naw", "Hey", "Yay", "Nay", "Pow", "Wow", "Moo", "Boo", "Bye", "Yum", "Ugh", "Bah", "Umm", "Why", "Aha", "Aye", "Hmm", "Hah", "Huh", "Ssh", "Brr", "Heh", "Oop", "Oof", "Zzz", "Gee", "Grr", "Yup", "Gah", "Mmm", "Dag", "Arr", "Eww", "Ehh"]
    for (var i = 0; i < Math.floor(Math.random() * 4) + 2; i++) {
        name += words[Math.floor(Math.random() * words.length)]
    }
    return name
}

//name gen v2
function  newUsername() {
    const min = Math.ceil(5)
    const max = Math.floor(16)
    const length = Math.floor(Math.random() * (max - min + 1)) + min
    return salt(length)
}

//format uptime
function getTime(from) {
    const calc = Date.now() - from
    return convertTime((calc / 1000).toFixed())
}
function convertTime(number) {
    return `${formatTime(Math.floor(number / 60))}:${formatTime(number % 60)}`
}
function formatTime(time) {
    if (10 > time) return "0" + time
    return time
}

//save data
function saveConfig() {
    API.send('config', (event, {
        "botUsename": document.getElementById('botUsename').value,
        "botConnectIp": document.getElementById('botConnectIp').value,
        "botCount": document.getElementById('botCount').value,
        "joinDelay": document.getElementById('joinDelay').value,
    }))
}

//create new bot
function newBot(options) {
    API.send('newBot', (options))
} 

export { connectBot, addPlayer, rmPlayer, sendLog, exeAll, makeParty, addLeader, resetParty, getTime, saveConfig } 
