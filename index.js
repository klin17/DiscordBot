//imports
require('dotenv').config();
const Discord = require('discord.js');
const { parseCommand, parseKeyword } = require('./commands');
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
        msg.delete().catch(console.error);;
        return true;
    }
    return false;
}

// fires when any message is created
client.on('message', msg => {
    if(msg.author.bot) { // do not respond to bots
        return;
    }
    //banned msgs are not further processed
    if(filterBannedStrings(msg)) {
        return;
    }
    parseCommand(msg);
    parseKeyword(msg);
});

// login to discord (should happen after setup of event handlers)
client.login(process.env.DISCORD_TOKEN);