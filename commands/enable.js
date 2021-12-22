const fs = require('fs');
const { getCommands, getKeywords } = require('../utils');
const disabled = require('../disabled.json');

module.exports = {
    name: "enable",
    usage: "enable <action name>",
    description: "undoes $disable <action name>",
    restricted: true,
    action: (msg, cmdArgs) => {
        const commands = getCommands();
        const keywords = getKeywords();
        let toEnable = cmdArgs[0];
        if(commands[toEnable] || keywords[toEnable]) {
            let index = disabled["disabled"].indexOf(toEnable);
            if(index >= 0) {
                disabled["disabled"].splice(index, 1);
                fs.writeFileSync('disabled.json', JSON.stringify(disabled, null, 4));
                msg.channel.send("Enabled action: " + toEnable);
            } else {
                msg.channel.send("Action: " + toEnable + " is not disabled");
            }
        } else {
            msg.channel.send("No command or keyword named: " + toEnable);
        }
    },
}