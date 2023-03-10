const { ipcMain } = require('electron')
const { EventEmitter } = require('events')
const botApi = new EventEmitter()
const { GoalNear } = require('mineflayer-pathfinder').goals
const { app, mainWindow } = require('../../main.js')
const dataPath = app.getPath("userData")
const v = require('vec3')
const https = require('https')
const fs = require('fs')
//get old logins

let oldLogins
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

//http get function
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

//log in functions
//check for new emails
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

//register a new user witha verification code using 1secmail's API
let accData = []
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
    const checkMsg = () => {
        bot.once('messagestr', (message) => {
            if(message.includes("/pin <pin> <pin>")) {
                bot.chat("/pin 0212 0212")
                checkMsg()
                return
            }
            if(message.includes("Account now registered with")) {
                commands.push('0212')
                const data = (commands.toString('\n').replace(/,\n/g , '') + '\n')
                accData.push(data)
                return
            }
            checkMsg()
        })
    }
    checkMsg()
}

//logging in account which already is registerd but needs a averification code
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
        const checkMsg = () => {
            bot.once('messagestr', (message) => {
                if(message.includes("You have verified your login.")) {
                    bot.chat("/pin 0212 0212")
                    return
                }
                checkMsg()
            })
        }
        checkMsg()
        
    } catch (error) {
        bot.quit()
    }
}

//entering the pin to log in
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

//navigate in storage container windows
function navigateWindow(that, actions, titles, backActions) {
    const bot = that.bot
    bot.once("windowOpen", (window) => {
        for (let i = 0; i < actions.length; i++) {
            if(that.cancelBW) return
            if (window.title === titles[i]) {
                console.log(bot.username, "opened", titles[i])
                if(i !== (actions.length - 1)) {
                    navigateWindow(that, actions, titles, backActions)
                }
                bot.clickWindow(actions[i], 0, 0)
                return
            }        
        }
        if(that.cancelBW) return
        console.log(bot.username, "navigating back in window")
        navigateWindow(that, actions, titles, backActions)
        bot.clickWindow(backActions, 0, 0)
    })
    return
}

//join a game of bedwars on herobrine.org
async function joinBedWars(that, mode) {
    const bot = that.bot
    that.dontJoinBW = true
    that.cancelBW = false
    const actions = [19, mode]
    const titles = ['{"text":"Games"}', '{"text":"BedWars"}']
    const backActions = 16
    if (bot.scoreboard['1']) {
        if(bot.scoreboard['1'].title.toLowerCase().includes('bed wars')) {
            console.log(bot.username, "is already in Bedwars")
            return
        }
        if (bot.scoreboard['1'].name.includes('fb-')) { //1.18.2: (bot.scoreboard['1'].name.includes('fb-')) 1.8.8: (bot.scoreboard['1'].title.toLowerCase().includes('herobrine'))
            console.log(bot.username, "is already in Lobby")
            navigateWindow(that, actions, titles, backActions)
            bot.setQuickBarSlot(0)
            bot.activateItem()
            return
        }
    }
    console.log(bot.username, "going to Lobby")
    bot.once('spawn', () => {
        if(that.cancelBW) return
        joinBedWars(that, mode)
    })
    bot.chat("/lobby 1")
}

//collect recsources by fu??nding items and then pathfinding towards them
async function collectRec(that, count) {
    that.recCollectionDone = false
    const bot = that.bot
    bot.once("itemDrop", async (entity) => {
        if(that.recCollectionDone) return
        const id = that.getItemID(entity)
        if(that.ids.includes(id)) {
            const p = entity.position
            console.log(p)
            //bot.pathfinder.stop()
            bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
            await delay(2000)
            let oldCount = 0
            while (!that.recCollectionDone) {
                await delay(4000)
                if(that.recCollectionDone) return
                const ironItems = bot.inventory.items().filter(item => (item.name === "iron_ingot" && item.count < 64))
                if (ironItems.length === 0) break
                const newCount = ironItems['0'].count
                if (count && newCount >= count) {
                    botApi.emit(bot.username+'stopRecCollection')
                }
                if(oldCount >= newCount) break
                oldCount = newCount
            }
        }
        if(that.recCollectionDone) return
        bot.pathfinder.setGoal(null)
        collectRec(that, count)
    })
    return
}

//check if a bed block is at this postion
async function checkBed(bot, direction, basePos, t, listenBlockUpdate) {
    let done = false
    botApi.once(bot.username+'foundbed'+direction, () => {
        done = true
    })
    let x = basePos[direction]['x']
    let y = basePos[direction]['y']
    let z = basePos[direction]['z']
    while (t < 5000 && !done) {
        let dl = 200
        await delay(50)
        if(done) return
        if(bot.blockAt(basePos[direction])) {
            listenBlockUpdate = false
            dl = 50
            const pos = bot.findBlocks({point: basePos[direction], matching: (block) => block.name.includes('bed')})[0]
            if(pos && !done) {
                const playerList = Object.keys(bot.players)
                for (let i = 0; i < playerList.length; i++) {
                    if(done) return
                    botApi.emit(playerList[i]+'foundbed'+direction, pos)
                }
                return
            }
        }
        if (listenBlockUpdate && !done) {
            bot.world.once(`blockUpdate:(${x}, ${y}, ${z})`, () => {
                if(done) return
                listenBlockUpdate = true
                checkBed(bot, direction, basePos, t, true)
            })
        }
        if(done) return
        await delay(dl)
        t += dl
    }
}

//find beds in a world
async function findBeds(bot) {
    let basePos = {}
    let bedsPos = {}
    basePos.N = v(0, 66, -64)
    basePos.E = v(64, 66, 0)
    basePos.S = v(0, 66, 64)
    basePos.W = v(-64, 66, 0)
    const directions = Object.keys(basePos)
    for (let i = 0; i < directions.length; i++) {
        let direction = directions[i]
        if (bedsPos[direction]) continue
        botApi.once(bot.username+'foundbed'+direction, (pos) => {
            bedsPos[direction] = pos
            console.log(pos)
        })
        checkBed(bot, direction, basePos, 0, true)
    }
}

function sendLog(msg) {
    mainWindow.webContents.send('sendLog', msg)
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

//token for master
function genToken() {
    const masterToken = salt(20)
    mainWindow.webContents.send('newMasterToken', masterToken)
    console.log(masterToken)
    return masterToken
}

//save login data for registered accounts
function saveAccData() {
    try {
        const data = accData.join('')
        fs.writeFileSync(dataPath + '\\bots_reg.csv', data , { flag: 'a' })
    } catch (error) {
        console.error(error)
    }
}

//set up the API for bot events

botApi.on("login", (name)=> {
    mainWindow.webContents.send('addPlayer', name)
    sendLog(`<li> <img src="./assets/icons/app/arrow-right.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(68%) sepia(74%) saturate(5439%) hue-rotate(86deg) brightness(128%) contrast(114%)"> ${name} Logged in.</li>`)
})
botApi.on("spawn", (name)=> {
    sendLog(`<li> <img src="./assets/icons/app/arrow-right.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(26%) sepia(94%) saturate(5963%) hue-rotate(74deg) brightness(96%) contrast(101%)"> ${name} Spawned.</li>`)
})
botApi.on("kicked", (name, reason)=> {
    mainWindow.webContents.send('rmPlayer', name)
    sendLog(`<li> <img src="./assets/icons/app/arrow-left.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(11%) sepia(92%) saturate(6480%) hue-rotate(360deg) brightness(103%) contrast(113%)"> [${name}] : ${reason}</li>`)
})
botApi.on("end", (name, reason)=> {
    mainWindow.webContents.send('rmPlayer', name)
    sendLog(`<li> <img src="./assets/icons/app/alert-triangle.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(100%) sepia(61%) saturate(4355%) hue-rotate(357deg) brightness(104%) contrast(104%)"> [${name}] ${reason}</li>`)
})
botApi.on("error", (name, err)=> {
    mainWindow.webContents.send('rmPlayer', name)
    sendLog(`<li> <img src="./assets/icons/app/alert-triangle.svg" class="icon-sm" style="filter: brightness(0) saturate(100%) invert(89%) sepia(82%) saturate(799%) hue-rotate(1deg) brightness(103%) contrast(102%)"> [${name}] ${err}</li>`)
})

mainWindow.once('closed', () => {
    saveAccData()
    app.quit()
})

module.exports = { regUser, emailLoginUser, pinLoginUser, joinBedWars, collectRec, findBeds, sendLog, delay, salt, genToken, mainWindow, botApi, ipcMain }