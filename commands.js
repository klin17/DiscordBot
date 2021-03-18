const { strAfter, pickRandom } = require("./utils");
const private = require('./private.json');
const adminIDs = private.admins;
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
            if(resp) {
                msg.channel.send(resp);
            }
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
        description: "sends the help message for a command, or lists commands",
        action: (msg, cmdArgs) => {
            if(cmdArgs.length > 0) {
                let command = commands[cmdArgs[0]];
                if(command) {
                    let use = command["usage"];
                    let desc = command["description"];
                    msg.channel.send("Usage: " + PROMPTCHAR + use);
                    msg.channel.send(desc);
                } else {
                    msg.channel.send("No match for command: " + cmdArgs[0]);
                }
            } else {
                //call $commands
                commands["commands"]["action"](msg, cmdArgs);
            }
        },
    },

    whoami: {
        usage: "whoami",
        description: "responds with username (or bot admin if applicable)",
        restricted: true,
        action: (msg, cmdArgs) => {
            if(adminIDs.includes(msg.author.id)) {
                msg.channel.send("bot admin");
            } else {
                msg.channel.send("User: " + msg.author.username);
            }
        },
    },

    prune: {
        usage: "prune <n>",
        description: "deletes the last <n> messages. Capped at n = 100",
        restricted: true,
        action: async (msg, cmdArgs) => {
            let num = parseInt(cmdArgs[0]);
            if(!num || isNaN(num)) {
                msg.channel.send("prune requires a number of messages to delete");
            } else if (num > 100) {
                msg.channel.send("Cannot prune more than 100 lines");
            } else if (num >= 1) {
                // delete num lines
                console.log(typeof(num));
                console.log("num is: ");
                console.log(num);
                await msg.channel.messages.fetch({limit: num}).then(messages => {
                    msg.channel.bulkDelete(messages);
                    msg.channel.send("Removed " + messages.size.toString() + " messages!");
                })
            }
            //ignore if num < 1
        }
    },
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
    },
    "shia labeof": {
        action: (msg) => {
            msg.channel.send("JUST DO IT");
        }
    },
}

exports.parseCommand = (msg) => {
    if(!msg.content) {
        return;
    }
    if(msg.content.startsWith(PROMPTCHAR)){
        //Then process the potential command

        let [cmdWord, ...args] = msg.content.split(/ +/); // split on spaces (not all whitespace)
        cmdWord = cmdWord.slice(PROMPTCHAR.length).toLowerCase(); //get rid of the initial prompt char
        let cmdObj = commands[cmdWord];
        if(cmdObj) {
            if(cmdObj.restricted) {
                //check if author is bot admin
                if(!adminIDs.includes(msg.author.id)) {
                    let potentialPass = args[0];
                    // check if user used the admin password
                    if(potentialPass != private.adminPass) {
                        console.log("User " + msg.author.username + " cannot use command " + cmdWord + " without password following");
                        console.log(msg.author.id);
                        return;
                    } else {
                        // remove message that has the password in it
                        msg.delete();
                    }
                }
            }
            console.log("calling " + cmdWord + " with args: ");
            console.log(args)
            cmdObj.action(msg, args);
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
        }
    }
}

exports.commands = commands;