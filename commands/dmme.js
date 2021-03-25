const { dmUser } = require("../utils");

module.exports = {
    name: "dmme",
    usage: "dmme <message>",
    description: "DMs command caller with <message>",
    action: (msg, cmdArgs) => {
        dmUser(msg.author, cmdArgs.join(" "));
    }
}