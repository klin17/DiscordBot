const { defaultBadArgResponse } = require("../botActions");

module.exports = {
    name: "prune",
    usage: "prune <n>",
    description: "deletes the last <n> messages starting from (start) messages back. Capped at n = 100",
    restricted: true,
    action: async (msg, cmdArgs) => {
        let num = parseInt(cmdArgs[0]);
        if(!num || isNaN(num) || num > 100 || num < 1) {
            msg.channel.send("Don't forget to include an integer from 1-100 number of messages to delete");
        } else {
            // delete num lines
            msg.channel.bulkDelete(num)
                .then(delMessages => msg.channel.send("Removed " + delMessages.size.toString() + " messages!"))
                .catch(console.error);
        }
    }
}