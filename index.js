const Discord = require('discord.js');
const { testFunc, parseCommand } = require('./commands');
// Create instance of discord client
const client = new Discord.Client();

// fires when client first connects
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// fires when any message is created
client.on('message', msg => {
    parseCommand(msg);
    if (msg.content === 'ping') {
        msg.reply('pong');
        testFunc
    }
});

// login to discord (should happen after setup of event handlers)
client.login('ODIxODE2NTAzNzkxMTI0NTIz.YFJOQw.vsIcw0K-KAw-bsy3mEtpcs6DDFQ');