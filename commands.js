const { strAfter } = require("./utils");

const promptChar = "$";

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
        }
    }
}

const keywords = {
    "can i get a": {
        action: (msg) => {
            let rest = strAfter(msg.content.toLowerCase(), "can i get a").trim();
            if (rest.charAt(0) == 'n' && rest.charAt(1) == ' ') { // alias can i get an
                rest = rest.slice(2, rest.length);
            }
            if(rest.length > 0) {
                msg.channel.send(rest);
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
    if(words[0].length > 2 && words[0].charAt(0) == promptChar) {
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