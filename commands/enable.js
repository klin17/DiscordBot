const fs = require('fs');
const { getCommands } = require('../utils');
const disabled = require('../disabled.json');

module.exports = {
    name: "enable",
    usage: "enable <command>",
    description: "undoes $disable <command>",
    restricted: true,
    action: (msg, cmdArgs) => {
        const commands = getCommands();
        let toEnable = cmdArgs[0];
        if(commands[toEnable]) {
            let index = disabled["disabled"].indexOf(toEnable);
            if(index >= 0) {
                disabled["disabled"].splice(index, 1);
                fs.writeFileSync('disabled.json', JSON.stringify(disabled, null, 4));
                msg.channel.send("Enabled command: " + toEnable);
            } else {
                msg.channel.send("Command: " + toEnable + " is not disabled");
            }
        } else {
            msg.channel.send("No command named: " + toEnable);
        }
    },
}