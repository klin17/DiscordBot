const Discord = require('discord.js');
const { testFunc, parseCommand, parseKeyword } = require('./commands');
const { strReplaceAll } = require('./utils');
// Create instance of discord client
const client = new Discord.Client();

// fires when client first connects
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Word/Phrase banning
const bannedStrings = ["around the world"];

function filterBannedStrings(msg) {
    let cleanedContent = msg.content.toLowerCase();
    bannedStrings.forEach(s => {
        cleanedContent = strReplaceAll(cleanedContent, s, "");
    })
    if(cleanedContent !== msg.content.toLowerCase()) {
        // could send the cleaned content to msg.channel
        msg.channel.send("A message was deleted because it contained a banned phrase");
        msg.delete();
        return true;
    }
    return false;
}

// fires when any message is created
client.on('message', msg => {
    //banned msgs are not further processed
    if(filterBannedStrings(msg)) {
        return;
    }
    parseCommand(msg);
    parseKeyword(msg);
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
});

// login to discord (should happen after setup of event handlers)
client.login('ODIxODE2NTAzNzkxMTI0NTIz.YFJOQw.vsIcw0K-KAw-bsy3mEtpcs6DDFQ');