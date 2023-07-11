const Discord = require('discord.js');
const { PROMPTCHAR } = require("../botActions");
const { getCommands, getKeywords, sendEmbed } = require("../utils");
const disabled = require('../disabled.json');

module.exports = {
    name: "help",
    usage: "help (command/keyword name)",
    description: "sends description for (command/keyword), or lists commands and keywords",
    action: (msg, cmdArgs) => {
        const commands = getCommands();
        // check if first arg exists
        if(cmdArgs.length > 0) {
            // check for command
            const command = commands[cmdArgs[0]];
            if(command) {
                // get the status of the command
                let status = command.restricted ? "Restricted" : "Open Access";
                if(disabled.disabled.includes(command.name)) {
                    status += " - **Disabled**"
                }
                // Send the usage and description for the found command
                let commandsEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(PROMPTCHAR + cmdArgs[0])
                    .addFields(
                        { name: "Usage", value: "`" + PROMPTCHAR + command.usage + "`" },
                        { name: "Description", value: command.description },
                        { name: "Status", value: status }
                    );
                    
                sendEmbed(msg, commandsEmbed);
                return
            }

            // check for keyword
            const keywords = getKeywords();
            const keyword = keywords[cmdArgs[0]];
            if(keyword) {
                // Send the usage and description for the found keyword
                let keywordsEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(keyword.name)
                    .addFields(
                        { name: "Description", value: keyword.description },
                        { name: "Status", value: disabled.disabled.includes(keyword.name) ? "Disabled" : "Enabled" }
                    );
                    
                sendEmbed(msg, keywordsEmbed);
                return
            }

            // fallback if no command or keyword matching found
            msg.channel.send("No command or keyword with name: " + cmdArgs[0]);
        } else {
            //call $commands to list out all commands when no args
            commands["actions"]["action"](msg, cmdArgs);
        }
    },
}