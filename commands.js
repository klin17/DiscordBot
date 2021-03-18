const { strAfter, pickRandom } = require("./utils");

const PROMPTCHAR = "$";

// command format:
/*  commandWord: {
        usage: String,
        description: String,
        action: (msg: Message, cmdArgs: [String]) => void
    } 
*/
const commands = {
    echo: {
        usage: "echo <argument>",
        description: "bot replies with <argument>",
        action: (msg, cmdArgs) => {
            let resp = cmdArgs.join(" ");
            msg.channel.send(resp);
        },
    },

    commands: {
        usage: "commands",
        description: "lists all commands currently available",
        action: (msg, cmdArgs) => {
            let commandsArray = [];
            for(let c in commands) {
                commandsArray.push(c);
            }
            msg.channel.send("Commands: \n" + commandsArray.join("\n"));
        }
    },

    help: {
        usage: "help <optional cmd name>",
        description: "prints the help message for a command, or lists commands",
        action: (msg, cmdArgs) => {
            if(cmdArgs.length > 0) {
                let command = commands[cmdArgs[0]];
                if(command) {
                    let use = command["usage"];
                    let desc = command["description"];
                    msg.channel.send("Usage: " + PROMPTCHAR + use);
                    msg.channel.send("\t" + desc);
                } else {
                    msg.channel.send("No match for command: " + command);
                }
            } else {
                commands["commands"]["action"](msg, cmdArgs);
            }
        },
    }
}


const getPics = {
    "owa owa": [
        "https://cdn.discordapp.com/attachments/821835099456405504/821873042032558110/pudgywoke-tiktok-videos.jpg",
        "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/ed982d1fc0483573a78f34824cb6b3e8~c5_720x720.jpeg?x-expires=1616115600&x-signature=JBa3WwoMJNT%2F4q2S2W2dmtsLXIg%3D",
        "https://pbs.twimg.com/profile_images/1337810830138744837/bxhDUW5-_400x400.jpg",
        "https://hashtaghyena.com/wp-content/uploads/2021/01/IMG_4374.jpeg",
        "https://media1.popsugar-assets.com/files/thumbor/lqNAj98ANxGQ7DycASpJsRkOQ00/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2021/01/12/187/n/1922243/addurlAw4hlQ/i/pudgywoke.jpg",
    ],
    "shaq": [
        "https://cdn.discordapp.com/attachments/821580269286457347/821884871512686602/https3A2F2Fblogs-images.png", 
        "https://cdn.discordapp.com/attachments/821580269286457347/821884893038247946/image.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821884935769948160/shaq1.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821884960151175189/images.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885282986229770/shaq-endorsements.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885526897328178/shaquille-oneal-apjpg-9375ed782cfd464d.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885546669408366/shaquille-oneal-music-videos.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885583546122240/images.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885653943189514/images.png",
    ],
}

const keywords = {
    "can i get a": {
        action: (msg) => {
            let rest = strAfter(msg.content.toLowerCase(), "can i get a").trim();
            if (rest.charAt(0) == 'n' && rest.charAt(1) == ' ') { // alias can i get an
                rest = rest.slice(2, rest.length);
            }
            if(rest.length > 0) {
                let fs = [];
                if(rest.includes("owa owa")) {
                    fs.push(pickRandom(getPics["owa owa"]));
                }
                if(rest.includes("shaq")) {
                    fs.push(pickRandom(getPics["shaq"]));
                }
                msg.channel.send(rest, {files: fs});
            }
        }
    }
}

exports.parseCommand = (msg) => {
    if(!msg.content) {
        return;
    }
    let words = msg.content.split(" "); // split on spaces
    if(words.length <= 0) {
        return;
    }
    if(words[0].length > 2 && words[0].charAt(0) == PROMPTCHAR) {
        // then see if a command exists that matches
        let firstWord = words.shift();
        let cmdWord = firstWord.slice(1);
        let cmdObj = commands[cmdWord];
        if(cmdObj) {
            console.log("calling " + cmdWord + " with args: ");
            console.log(words)
            cmdObj.action(msg, words);
        } else {
            console.log("command: " + cmdWord + " was not found");
        }
    }
}

exports.parseKeyword = (msg) => {
    if(!msg.content) {
        return;
    }
    for(let keyphrase in keywords) {
        if(msg.content.toLowerCase().includes(keyphrase)) {
            console.log("found keyphrase " + keyphrase);
            keywords[keyphrase].action(msg);
        } else {
            console.log(keyphrase + " was not found");
            console.log(msg.content.toLowerCase());
            console.log(msg.content.toLowerCase().includes(keyphrase));
        }
    }
}

exports.commands = commands;