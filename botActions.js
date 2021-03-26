// imports
const Discord = require('discord.js');
const { pickRandom, getCommands } = require("./utils");
const { isAdmin } = require("./privileges");

// COMMAND HANDLING: --------------

const PROMPTCHAR = "$";
exports.PROMPTCHAR = PROMPTCHAR; //must be before call getCommands() to avoid circular dependency

exports.defaultBadArgResponse = (msg, commandName) => {
    msg.channel.send("Use " + PROMPTCHAR + "help " + commandName + ", for more info");
}

// command object format:
/*  commandName: {
        name: String,
        usage: String,
        description: String,
        restricted?: boolean?,
        action: (msg: Message, cmdArgs: String[]) => void
    } 
*/
const commands = getCommands();

exports.parseCommand = (msg) => {
    if(!msg.content) {
        return;
    }
    if(msg.content.startsWith(PROMPTCHAR)){
        //Then process the potential command
        let [cmdWord, ...args] = msg.content.trim().split(/ +/); // split on spaces (not all whitespace)
        cmdWord = cmdWord.slice(PROMPTCHAR.length).toLowerCase(); //get rid of the initial prompt char
        let cmdObj = commands[cmdWord];
        if(cmdObj) {
            if(cmdObj.restricted) {
                //check if author is bot admin
                if(!isAdmin(msg.author.id)) {
                    console.log("non admin attempt to run command: " + cmdWord);
                    return;
                }
            }
            console.log("calling " + cmdWord + " with args: ");
            console.log(args)
            cmdObj.action(msg, args);
        } else {
            console.log("command: " + cmdWord + " was not found");
            console.log(commands);
        }
    }
}


// Keywords: ----------------

const getPics = {
    "owa owa": [
        "https://cdn.discordapp.com/attachments/821835099456405504/821873042032558110/pudgywoke-tiktok-videos.jpg",
        "https://pbs.twimg.com/profile_images/1337810830138744837/bxhDUW5-_400x400.jpg",
        "https://hashtaghyena.com/wp-content/uploads/2021/01/IMG_4374.jpeg",
        "https://media1.popsugar-assets.com/files/thumbor/lqNAj98ANxGQ7DycASpJsRkOQ00/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2021/01/12/187/n/1922243/addurlAw4hlQ/i/pudgywoke.jpg",
    ],
    "shaq": [
        "https://cdn.discordapp.com/attachments/821580269286457347/821884871512686602/https3A2F2Fblogs-images.png", 
        "https://cdn.discordapp.com/attachments/821580269286457347/821884893038247946/image.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821884935769948160/shaq1.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821884960151175189/images.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885526897328178/shaquille-oneal-apjpg-9375ed782cfd464d.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885546669408366/shaquille-oneal-music-videos.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885583546122240/images.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885653943189514/images.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/822255455035850762/unknown.png",
    ],
    "bananya": [
        "https://tenor.com/view/banana-cat-cute-kawaii-gif-13326985",
        "https://tenor.com/view/bananya-banana-cat-kawaii-cute-gif-11155423",
        "https://tenor.com/view/ck004-gif-8195459",
        "https://tenor.com/view/bananya-banana-kittens-gif-13326982",
        "https://tenor.com/view/cat-kitten-excited-happy-smile-gif-5681144",
        "https://tenor.com/view/cute-cat-bananya-anime-kawaii-gif-5735863",
        "https://tenor.com/view/bananya-banana-cat-cute-shining-eyes-gif-15873885",
        "https://tenor.com/view/banana-fruits-gif-7763515",
        "https://tenor.com/view/banana-kitty-cat-gif-13333733",
        "https://cdn.discordapp.com/attachments/821835099456405504/823964378683539466/bFXfuA8.gif",
        "https://cdn.discordapp.com/attachments/821835099456405504/823964287168938014/51d0a2401492fd1560969079c22b1051db512777a77eb3955a2716cd1f23eeb4_1.gif",
    ]
}

const keywords = {
    "can i get a": {
        regexStrings: ["c+a+n+ +i+ +g+e+t+ +a+n*", "gi"],
        action: (msg) => {
            let regex = makeRegex(keywords["can i get a"].regexStrings);
            regex.test(msg.content);
	        let rest = msg.content.slice(regex.lastIndex, msg.content.length);

            if(rest.length > 0) {
                let piclinks = [];
                for(let key in getPics) {
                    let keyExp = RegExp(key.split("").join("+") + "+", "i");
                    if(rest.match(keyExp)) {
                        piclinks.push(pickRandom(getPics[key]));
                    }
                }
                msg.channel.send(rest);
                piclinks.forEach(link => msg.channel.send(link));
            }
        }
    },
    "shia labeouf": {
        regexStrings: ["s+h+i+a+ +l+a+b+e+o+u+f+", "gi"],
        action: (msg) => {
            msg.channel.send("JUST DO IT");
        }
    },
}

function makeRegex([s, flags]) {
    return new RegExp(s, flags);
}

exports.parseKeyword = (msg) => {
    if(!msg.content) {
        return;
    }
    for(let key in keywords) {
        if(makeRegex(keywords[key].regexStrings).test(msg.content)) {
            console.log("found keyphrase " + key);
            keywords[key].action(msg);
        }
    }
}

