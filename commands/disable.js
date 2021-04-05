const fs = require('fs');
const { getCommands } = require('../utils');
const disabled = require('../disabled.json');

module.exports = {
    name: "disable",
    usage: "disable <command>",
    description: "prevents <command> from working",
    restricted: true,
    action: (msg, cmdArgs) => {
        let toDisable = cmdArgs[0];
        const commands = getCommands();
        if(commands[toDisable]) {
            let index = disabled["disabled"].indexOf(toDisable);
            if(index >= 0) {
                msg.channel.send("Command: " + toDisable + "is already disabled");
            } else {
                disabled["disabled"].push(toDisable);
                fs.writeFileSync('disabled.json', JSON.stringify(disabled, null, 4));
                msg.channel.send("Disabled command: " + toDisable);
            }
        } else {
            msg.channel.send("No command named: " + toDisable);
        }
    },
}