const { strAfter, pickRandom } = require("./utils");
const private = require('./private.json');
const { isAdmin, isPermAdmin } = require("./botprivileges");
const PROMPTCHAR = "$";
const numberEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
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
            if(isAdmin(msg.author.id, cmdArgs[0])) {
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

    atrandom: {
        usage: "atRandom",
        description: "@s someone random in the server",
        restricted: true,
        action: (msg, cmdArgs) => {
            msg.guild.members.fetch({force: true}).then(members => {
                let humans = [];
                members.forEach(m => {
                    if(!m.user.bot) {
                        humans.push(m.user);
                    }
                })
                let randID = pickRandom(humans).id;
                msg.channel.send(`HI <@${randID}>`);
            });
        },
    },

    login: {
        usage: "login <password>",
        description: "logs in as bot admin until midnight",
        action: (msg, cmdArgs) => {
            if(isPermAdmin(msg.author.id)) {
                msg.channel.send("User is already permanent admin");
            } else if(cmdArgs[0] && isAdmin(msg.author.id, cmdArgs[0])) {
                msg.delete();
                msg.channel.send("User has bot admin privileges for 5 min");
            } else {
                msg.channel.send("Incorrect password");
            }
        },
    },

    poll: {
        usage: 'poll "question to ask" "item1" "item2"...',
        description: "creates reaction poll using parameters, up to 10 items",
        action: async (msg, cmdArgs) => {
            // poll needs different splitting, convert to expected
            cmdArgs = [" "].concat(cmdArgs).join(" ").split(/\s+"/);
            cmdArgs.shift();

            if(cmdArgs.length > 2 && cmdArgs.length <= 11) {
                // function for removing ending quotation mark
                const withoutLast = (s) => s.substring(0, s.length - 1);
                // function for getting boxed number emojis (1) => 2
                const getNumEmoji = (i) => String.fromCharCode(49+i, 0xFE0F, 0x20E3)
                // Generate poll as a string
                const question = withoutLast(cmdArgs.shift());
                let pollString = cmdArgs.reduce(
                    (acc, e, i) => acc + '\n-' + getNumEmoji(i) + ' ' + withoutLast(e), 
                    question
                );
                // Send the pollstring and add reactions
                await msg.channel.send(pollString).then(sentMessage => {
                    cmdArgs.forEach((val, i) => sentMessage.react(getNumEmoji(i)));
                    msg.delete({ timeout: 1500 }).catch(console.error);
                });
            } else {
                msg.channel.send("Use " + PROMPTCHAR + "help poll, for more info");
            }
        }
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
        "https://cdn.discordapp.com/attachments/821580269286457347/822255455035850762/unknown.png",
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
    "shia labeouf": {
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