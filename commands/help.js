const Discord = require('discord.js');
const { PROMPTCHAR } = require("../botActions");
const { getCommands } = require("../utils");
const disabled = require('../disabled.json');

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
                // get the status of the command
                let status = command.restricted ? "Restricted" : "Open Access";
                if(disabled.disabled.includes(command.name)) {
                    status += " - Disabled"
                }
                // Send the usage and description for the found command
                let commandsEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(PROMPTCHAR + cmdArgs[0])
                    .addField("Usage", "`" + PROMPTCHAR + command.usage + "`")
                    .addField("Description", command.description)
                    .addField("Status", status);
                    
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