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
            console.log("echo action called");
            let resp = cmdArgs.join(" ");
            console.log(resp);
            msg.channel.send(resp);
        }
    }
}

exports.parseCommand = (msg) => {
    console.log(msg.content);
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
            cmdObj.action(msg, words);
        } else {
            console.log("command: " + cmdWord + " was not found");
        }
    }
}

exports.testFunc = () => {
    console.log("testfunc was called");
}
