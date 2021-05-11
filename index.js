// Get the process to know when we stop running
const process = require('process');

process.on("exit", () => console.log("process will exit now"));
process.on('SIGINT', (signal) => {
    console.log("sigint received");
    process.exit();
});

//imports
require('dotenv').config();
const Discord = require('discord.js');
const { parseCommand, parseKeyword } = require('./botActions');
const { checkedPokeHelp } = require('./pokeutils');

// Create instance of discord client
const client = new Discord.Client();

// fires when client first connects
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Word/Phrase banning
const bannedRegexStrings = [
    'a+ *r+ *(o+|0+)* *u*n+ *d+ *((t+h+(e|3)*)|z+) *w+ *(o+|0+)*r+ *l+ *d+',
    'v+ *i+ *c+ *k* *t+ *(o+|0+)* *r+ *y+ *r+ *(o+|0+)* *y+ *a* *l+ *(e|3)+',
    'i+c+h+i+ *n+i+ *s+a+n+ *n+y+a+',
];

function filterBannedStrings(msg) {
    bannedRegexStrings.forEach(s => {
        let regex = RegExp(s, "gi");
        if(regex.test(msg.content)) {
            msg.delete().then(message => {
                message.channel.send("A message was deleted because it contained a banned phrase");
            }).catch(console.error);;
            return true;
        }
    })
    return false;
}

// fires when any message is created
client.on('message', msg => {
    if(msg.author.bot) { // message came from a bot
        if(msg.author.username == "Pokémize") {
            if(msg.embeds[0]?.title == "A wild Pokémon has appeared!") {
                const pokeimageurl = msg.embeds[0].thumbnail.url;
                checkedPokeHelp(pokeimageurl, msg.channel);
            }
        }
        return;
    }
    //banned msgs are not further processed
    if(filterBannedStrings(msg)) {
        return;
    }
    parseCommand(msg);
    parseKeyword(msg);
});

client.on("disconnect", () => {
    console.log(`websocket disconnect`);
});

// login to discord (should happen after setup of event handlers)
client.login(process.env.DISCORD_TOKEN);