
const Discord = require('discord.js');
const { PROMPTCHAR } = require('../botActions.js');
const { getCommands, getKeywords } = require("../utils.js");
const disabled = require('../disabled.json');

module.exports = {
    name: "actions",
    usage: "actions (all)",
    description: "lists usages for unrestricted or (all) commands and keywords",
    action: (msg, cmdArgs) => {
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

        // Get all keywords and descriptions
        let enabledKeywords = [];
        let disabledKeywords = [];
        const keywords = getKeywords();
        for(let k in keywords) {
            let keywordDescription = "`" + keywords[k].name + "`: " + keywords[k].description;
            if(disabled.disabled.includes(keywords[k].name)) {
                disabledKeywords.push(keywordDescription);
            } else {
                enabledKeywords.push(keywordDescription);
            }
        }

        // Create the embed
        let actionsEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Bot Actions')
            .setDescription(usageHelp + "\nUse `" + PROMPTCHAR + "help (actionName)` for info on a specific action");
        if(cmdArgs[0] == "all") {
            actionsEmbed.addField("Open Access Commands", unrestrictedDescriptions.join("\n"));
            actionsEmbed.addField("Restricted Commands", restrictedDescriptions.join("\n"));
            let disabledCommandsContent = disabledDescriptions.length > 0 ? disabledDescriptions.join("\n") : "No disabled commands";
            actionsEmbed.addField("Disabled Commands", disabledCommandsContent);

            actionsEmbed.addField("Enabled Keywords", enabledKeywords.join("\n"));
            let disabledKeywordsContent = disabledKeywords.length > 0 ? disabledKeywords.join("\n") : "No disabled keywords";
            actionsEmbed.addField("Disabled Keywords", disabledKeywordsContent);
        } else {
            actionsEmbed.addField("Commands", unrestrictedDescriptions.join("\n"));
            actionsEmbed.addField("Keywords", enabledKeywords.join("\n"));
            // actionsEmbed.setDescription(usageHelp + "\n\n" + unrestrictedDescriptions.join("\n"));
        }

        msg.channel.send({ embeds: [actionsEmbed] });
    }
}