const { MessageEmbed } = require('discord.js');
const { PROMPTCHAR } = require('../botActions.js');
const { getCommands, sendEmbed } = require("../utils.js");
const disabled = require('../disabled.json');

module.exports = {
    name: "commands",
    usage: "commands (all)",
    description: "lists usages for unrestricted or (all) commands",
    action: (msg, cmdArgs) => {
        console.log("Running $commands...");
        let usageHelp = "Parenthesis denotes optional arguments, angle brackets denote required arguments";

        // Generate list of descriptions for all commands, placing into arrays by status
        let unrestrictedDescriptions = [];
        let restrictedDescriptions = [];
        let disabledDescriptions = [];
        const commands = getCommands();
        for(let c in commands) {
            let commandDescription = "`" + PROMPTCHAR + commands[c].usage + "`";
            if(disabled.disabled.includes(commands[c].name)) {
                disabledDescriptions.push(commandDescription);
            } else if(commands[c].restricted){
                restrictedDescriptions.push(commandDescription);
            } else {
                unrestrictedDescriptions.push(commandDescription);
            }
        }
        // Create the embed
        let commandsEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Command Usages')
            .setDescription(usageHelp + "\nUse `" + PROMPTCHAR + "help (commandName)` for info on a specific command");
        if(cmdArgs[0] == "all") {
            commandsEmbed.addField("Open Access", unrestrictedDescriptions.join("\n"));
            commandsEmbed.addField("Restricted", restrictedDescriptions.join("\n"));
            let disabledFieldContent = disabledDescriptions.length > 0 ? disabledDescriptions.join("\n") : "No disabled commands";
            commandsEmbed.addField("Disabled", disabledFieldContent);
        } else {
            commandsEmbed.setDescription(usageHelp + "\n\n" + unrestrictedDescriptions.join("\n"));
        }

        sendEmbed(msg, commandsEmbed);
    }
}