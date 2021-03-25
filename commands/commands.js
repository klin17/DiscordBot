const Discord = require('discord.js');
const { PROMPTCHAR } = require('../botActions.js');
const { getCommands } = require("../utils.js");

module.exports = {
    name: "commands",
    usage: "commands (all)",
    description: "lists usages for unrestricted or (all) commands",
    action: (msg, cmdArgs) => {
        let usageHelp = "Parenthesis denotes optional arguments, angle brackets denote required arguments";

        // Generate list of descriptions for restricted and unrestricted commands
        let unrestrictedCommandDescriptions = [];
        let restrictedCommandDescriptions = [];
        const commands = getCommands();
        for(let c in commands) {
            let commandDescription = "`" + PROMPTCHAR + commands[c].usage + "`";
            if(commands[c].restricted){
                restrictedCommandDescriptions.push(commandDescription);
            } else {
                unrestrictedCommandDescriptions.push(commandDescription);
            }
        }
        // Create the embed
        let commandsEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Command Usages')
            .setDescription(usageHelp + "\n");
        if(cmdArgs[0] == "all") {
            commandsEmbed.addField("Open Access", unrestrictedCommandDescriptions.join("\n"));
            commandsEmbed.addField("Restricted", restrictedCommandDescriptions.join("\n"));
        } else {
            commandsEmbed.setDescription(usageHelp + "\n\n" + unrestrictedCommandDescriptions.join("\n"));
        }

        msg.channel.send(commandsEmbed);
    }
}