const Discord = require('discord.js');
const { PROMPTCHAR } = require('../botActions.js');
const { getKeywords, sendEmbed } = require("../utils.js");
const disabled = require('../disabled.json');

module.exports = {
    name: "keywords",
    usage: "keywords (all)",
    description: "lists active or (all) keywords",
    action: (msg, cmdArgs) => {
        // Generate list of descriptions for all keywords, placing into arrays by status
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
        const helpMess = "Use `" + PROMPTCHAR + "help (keywordName)` for info on a specific keyword";
        let keywordsEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Keywords')
            .setDescription("\n" + helpMess);
        if(cmdArgs[0] == "all") {
            keywordsEmbed.addField("Enabled", enabledKeywords.join("\n"));
            let disabledFieldContent = disabledKeywords.length > 0 ? disabledKeywords.join("\n") : "No disabled keywords";
            keywordsEmbed.addField("Disabled", disabledFieldContent);
        } else {
            keywordsEmbed.setDescription(helpMess + "\n" + enabledKeywords.join("\n"));
        }

        sendEmbed(msg, keywordsEmbed);
    }
}