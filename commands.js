// imports
const Discord = require('discord.js');
const { pickRandom, strAfterRegex, dmUser } = require("./utils");
const { isAdmin, isPermAdmin, revokeAdmin, getPermAdminIDs } = require("./botprivileges");

// COMMANDS: --------------

const PROMPTCHAR = "$";

function defaultBadArgResponse(msg, commandName) {
    msg.channel.send("Use " + PROMPTCHAR + "help " + commandName + ", for more info");
}

// command format:
/*  commandWord: {
        usage: String,
        description: String,
        restricted?: boolean?,
        action: (msg: Message, cmdArgs: [String]) => void
    } 
*/
const commands = {
    echo: {
        usage: "echo <message>",
        description: "bot replies with <message>",
        action: (msg, cmdArgs) => {
            // send the cmdArgs joined back as one string
            let resp = cmdArgs.join(" ");
            if(resp) {
                msg.channel.send(resp);
            }
        },
    },

    commands: {
        usage: "commands (all)",
        description: "lists usages for unrestricted or (all) commands",
        action: (msg, cmdArgs) => {
            let usageHelp = "Parenthesis denotes optional arguments, angle brackets denote required arguments";

            // Generate list of descriptions for restricted and unrestricted commands
            let unrestrictedCommandDescriptions = [];
            let restrictedCommandDescriptions = [];
            for(let c in commands) {
                let commandDescription = "`" + PROMPTCHAR + commands[c].usage + "`";
                if(commands[c].restricted){
                    restrictedCommandDescriptions.push(commandDescription);
                } else {
                    unrestrictedCommandDescriptions.push(commandDescription);
                }
            }
            // Create the embed
            let commandsEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Command Usages')
                .setDescription(usageHelp + "\n");
            if(cmdArgs[0] == "all") {
                commandsEmbed.addField("Open Access", unrestrictedCommandDescriptions.join("\n"));
                commandsEmbed.addField("Restricted", restrictedCommandDescriptions.join("\n"));
            } else {
                commandsEmbed.setDescription(usageHelp + "\n\n" + unrestrictedCommandDescriptions.join("\n"));
            }

            msg.channel.send(commandsEmbed);
        }
    },

    help: {
        usage: "help (command name)",
        description: "sends description for (command), or lists commands",
        action: (msg, cmdArgs) => {
            if(cmdArgs.length > 0) {
                // check if first arg is a command
                let command = commands[cmdArgs[0]];
                if(command) {
                    // Send the usage and description for the found command
                    msg.channel.send("Usage: " + PROMPTCHAR + command["usage"]);
                    msg.channel.send(command["description"]);
                } else {
                    msg.channel.send("No match for command: " + cmdArgs[0]);
                }
            } else {
                //call $commands to list out all commands when no args
                commands["commands"]["action"](msg, cmdArgs);
            }
        },
    },

    whoami: {
        usage: "whoami",
        description: "responds with username (or bot admin if applicable)",
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
            if(!num || isNaN(num) || num > 100 || num < 1) {
                defaultBadArgResponse(msg, "prune");
            } else {
                // delete num lines
                await msg.channel.messages.fetch({limit: num}).then(messages => {
                    msg.channel.bulkDelete(messages);
                    msg.channel.send("Removed " + messages.size.toString() + " messages!");
                })
            }
        }
    },

    atrandom: {
        usage: "atRandom",
        description: "@s someone random in the server",
        restricted: true,
        action: (msg, cmdArgs) => {
            // get all members of guild
            msg.guild.members.fetch().then(members => {
                // filter out the bots
                let humans = [];
                members.forEach(m => {
                    if(!m.user.bot) {
                        humans.push(m.user);
                    }
                })
                // @ random choice from users
                let randID = pickRandom(humans).id;
                msg.channel.send(`HI <@${randID}>`);
            });
        },
    },

    login: {
        usage: "login <password>",
        description: "logs in as bot admin for 5 min if <password> correct",
        action: (msg, cmdArgs) => {
            if(isPermAdmin(msg.author.id)) {
                msg.channel.send("User is already permanent admin");
            } else if(cmdArgs[0] && isAdmin(msg.author.id, cmdArgs[0])) {
                msg.delete();
                msg.channel.send(`User <@${msg.author.id}> has bot admin privileges for 5 min`)
                msg.channel.send("User has bot admin privileges for 5 min");

                // DM permadmins that someone logged in
                let permadminids = getPermAdminIDs();
                permadminids.forEach(id => {
                    msg.client.users.fetch(id).then(permadmin => {
                        dmUser(permadmin, `${msg.author.username} logged in as admin`);
                    });
                })
            } else {
                msg.channel.send("Incorrect password");
            }
        },
    },

    revoke: {
        usage: "revoke (permanent) @<user>",
        description: "revokes admin privileges from <user> if they are not perm admin",
        restricted: true,
        action: (msg, cmdArgs) => {
            const user = msg.mentions.members.first();
            if(!user) {
                defaultBadArgResponse(msg, "revoke");
            } else if(user.id == msg.author.id) {
                msg.channel.send("Cannot revoke your own admin privileges");
            } else if(isPermAdmin(user.id)) {
                msg.channel.send("cannot revoke permanent admin privileges");
            } else {
                // decide if (permanent) arg is there
                let perm = false;
                if(cmdArgs[0] && cmdArgs[0] == "permanent"){
                    perm = true;
                }
                if(revokeAdmin(user.id, perm)) {
                    if(perm) {
                        msg.channel.send(`Revoked permissions for <@${user.id}> permanently`)
                    } else {
                        msg.channel.send(`Revoked permissions for <@${user.id}>`)
                    }
                }
            }
        }
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
                defaultBadArgResponse(msg, "poll");
            }
        }
    },

    mute: {
        usage: "mute @<person>",
        description: "gives <person> the Muted roll",
        restricted: true,
        action: (msg, cmdArgs) => {
            const mutee = msg.mentions.members.first();
            if(!mutee) {
                msg.channel.send("Don't forget to mention the person you want to mute");
            } else if (mutee.id == msg.author.id) {
                msg.channel.send("You cannot mute yourself");
            } else {
                const muterole = msg.guild.roles.cache.find(x => x.name === "Muted");
                if(!muterole) {
                    msg.channel.send("This server do not have role with name `Muted`");
                } else if(mutee.roles.cache.has(muterole)) {
                    msg.channel.send("Given User is already muted")
                } else {
                    mutee.roles.add(muterole)
                    msg.channel.send(`Muted <@${mutee.id}>`)
                }
            }
        },
    },

    unmute: {
        usage: "unmute @<person>",
        description: "removes the Muted role from <person>",
        restricted: true,
        action: (msg, args) => {
            const user = msg.mentions.members.first();
            let muterole = msg.guild.roles.cache.find(x => x.name === "Muted")
            user.roles.remove(muterole)
        },
    },

    sadreact: {
        usage: "sadreact",
        description: "adds a sad react to previous message",
        action: async (msg, cmdArgs) => {
            await msg.channel.messages.fetch({limit: 2}).then(messages => {
                if(messages.size == 2) {
                    const arr = messages.array();
                    arr[0].delete();
                    arr[1].react(`😢`);
                }
            })
        }
    },

    dmme: {
        usage: "dmme <message>",
        description: "DMs command caller with <message>",
        action: (msg, cmdArgs) => {
            dmUser(msg.author, cmdArgs.join(" "));
        }
    }
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

exports.commands = commands;