const fs = require('fs');
const { getCommands, getKeywords } = require('../utils');
const disabled = require('../disabled.json');

function disable(toDisable, isCommand, msg) {
    const objcs = isCommand ? getCommands() : getKeywords()
    const actionType = isCommand ? "Command" : "Keyword"
    if(objcs[toDisable]) {
        let index = disabled["disabled"].indexOf(toDisable);
        if(index >= 0) {
            msg.channel.send(actionType + ": " + toDisable + " is already disabled");
        } else {
            disabled["disabled"].push(toDisable);
            fs.writeFileSync('disabled.json', JSON.stringify(disabled, null, 4));
            msg.channel.send("Disabled" + actionType.toLowerCase() + ": " + toDisable);
        }
        return true
    }
    return false
}

module.exports = {
    name: "disable",
    usage: "disable <action name>",
    description: "prevents <action name> from working",
    restricted: true,
    action: (msg, cmdArgs) => {
        let toDisable = cmdArgs[0];
        if(toDisable == "disable") {
            msg.channel.send("Cannot disable the disable command");
            return
        }
        // if not a command and not a keyword
        if(!disable(toDisable, true, msg) && !disable(toDisable, false, msg)) {
            msg.channel.send("No command or keyword named: " + toDisable);
        }
    },
}