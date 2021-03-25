const Discord = require('discord.js');
const { PROMPTCHAR } = require("../botActions");
const { getCommands } = require("../utils");

module.exports = {
    name: "help",
    usage: "help (command name)",
    description: "sends description for (command), or lists commands",
    action: (msg, cmdArgs) => {
        if(cmdArgs.length > 0) {
            // check if first arg is a command
            const commands = getCommands();
            let command = commands[cmdArgs[0]];
            if(command) {
                // Send the usage and description for the found command
                let commandsEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(PROMPTCHAR + cmdArgs[0])
                    .addField("Usage", "`" + PROMPTCHAR + command.usage + "`")
                    .addField("Description", command.description);

                msg.channel.send(commandsEmbed);
            } else {
                msg.channel.send("No match for command: " + cmdArgs[0]);
            }
        } else {
            //call $commands to list out all commands when no args
            commands["commands"]["action"](msg, cmdArgs);
        }
    },
}