// imports
const Discord = require('discord.js');
const { getCommands, getKeywords, makeRegex } = require("./utils");
const { isAdmin } = require("./privileges");
const disabled = require("./disabled.json");

// Action Helpers

/**
 * 
 * @param {String} name The name of the action
 * @param {String} type The type of action ("Command" or "Keyword")
 * @returns {Boolean} Whether the action is disabled or not
 */
function checkDisabled(name, type) {
    if(disabled.disabled.includes(name)) {
        console.log(type + ": `" + name + "` is disabled");
        return true;
    } else {
        console.log(type + " - disabled array: ");
        console.log(disabled.disabled);
        return false;
    }
}

// COMMAND HANDLING: --------------

const PROMPTCHAR = "$";
exports.PROMPTCHAR = PROMPTCHAR; //must be before call getCommands() to avoid circular dependency

/**
 * Sends a default message in response to bad input for the given command name
 * 
 * @param {Discord.Message<boolean>} msg The message object
 * @param {String} commandName The name of the command
 */
exports.defaultBadArgResponse = (msg, commandName) => {
    msg.channel.send("Use `" + PROMPTCHAR + "help " + commandName + "` for more info");
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

/**
 * Parses a message for commands
 * 
 * @param {Discord.Message<boolean>} msg The message to parse
 */
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
            // handle restrictions on commands
            if(cmdObj.restricted) {
                //check if author is bot admin
                if(!isAdmin(msg.author.id)) {
                    console.log("non admin attempt to run command: `" + cmdWord + "`");
                    msg.channel.send("Command: `" + cmdWord + "`  is restricted");
                    return;
                }
            }
            // handle disabled commands
            if(checkDisabled(cmdWord, "Command")) {
                msg.channel.send(type + ": `" + cmdWord + "` is disabled");
                return;
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

// keyword object format:
/*  keywordName: {
        name: String,
        regexStrings: [String, String],
        // description: String,
        // restricted?: boolean?,
        action: (msg: Message) => void
    } 
*/
const keywords = getKeywords()

/**
 * Parses a message for a keyword
 * 
 * @param {Discord.Message<boolean>} msg The message to parse for a keyword
 */
exports.parseKeyword = (msg) => {
    if(!msg.content) {
        return;
    }
    for(let key in keywords) {
        if(makeRegex(keywords[key].regexStrings).test(msg.content)) {
            console.log("found keyphrase " + key);

            // handle disabled keywords
            if(checkDisabled(key, "Keyword")) {
                return;
            }
            keywords[key].action(msg);
        }
    }
}

