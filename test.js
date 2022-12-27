const mineflayer = require('mineflayer')
const fs = require('fs');
const { spawn } = require('child_process');
const scriptPath = '.\\hb-alt-gen_bots.ps1';
const { EventEmitter } = require('events')
const botApi = new EventEmitter()
let flag = true //load names from list?
lastexecTime = Date.now()

function delay(ms) {
    return new Promise(res => setTimeout(res, ms))
}

function  newUsername() {
    min = Math.ceil(3)
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
            fs.writeFile("C:\\Users\\Benjamin Fasthuber\\AppData\\Local\\Programs\\MultiMC\\instances\\1.8.9\\.minecraft\\FDPCLIENT-1.8\\accounts.json", fdp_accounts , { flag: 'w' }, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
            });
        }
    });
}

function newBot(username) {
    const options = {
        host: "herobrine.org",
        port: 25565,
        username: username
        //version: idBotVersion.value,
        //auth: idAuthType.value 
    }
    const bot = mineflayer.createBot(options)
    bot.once('login', ()=> {
        botApi.emit("login", bot.username)
    });
    
    bot.once('kicked', (reason)=> {
        botApi.emit("kicked", bot.username, reason)
        try {
            let reason_json = JSON.parse(reason)
            if(reason_json.hasOwnProperty('extra')) {
                reason_json = reason_json['extra']
                reason_text = reason_json.map(item => item.text).join('');
            } else {
                reason_text = reason_json['text'];
            }
            console.log(reason_text)
        } catch {
            console.log(reason)
        }
        
    });

    bot.once('error', (err)=> {
        botApi.emit("error", options.username, err)
        console.log(err)
    });
    
    bot.on('messagestr', (message) => {
        if(message.includes("register <email> <email>")) {
            regUser(bot , options.username)
        }
        console.log(message)
        
        if ((Date.now() - lastexecTime) > 1600) {
            lastexecTime = Date.now()
            bot.chat(message)
        }
        
    });
    botApi.on(options.username+'chat', (o) => { bot.chat(o) })
}
newBot('kgb')