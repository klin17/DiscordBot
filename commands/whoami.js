const { isAdmin } = require("../botPrivileges");

module.exports = {
    name: "whoami",
    usage: "whoami",
    description: "responds with username (or bot admin if applicable)",
    action: (msg, cmdArgs) => {
        if(isAdmin(msg.author.id, cmdArgs[0])) {
            msg.channel.send("bot admin");
        } else {
            msg.channel.send("User: " + msg.author.username);
        }
    },
}