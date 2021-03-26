const { defaultBadArgResponse } = require("../botActions");

module.exports = {
    name: "prune",
    usage: "prune <n>",
    description: "deletes the last <n> messages. Capped at n = 100",
    restricted: true,
    action: async (msg, cmdArgs) => {
        let num = parseInt(cmdArgs[0]);
        if(!num || isNaN(num) || num > 100 || num < 1) {
            defaultBadArgResponse(msg, "prune");
        } else {
            // delete num lines
            await msg.channel.messages.fetch({limit: num}).then(messages => {
                msg.channel.bulkDelete(messages)
                    .then(delMessages => msg.channel.send("Removed " + messages.size.toString() + " messages!"))
                    .catch(console.error);
            })
        }
    }
}