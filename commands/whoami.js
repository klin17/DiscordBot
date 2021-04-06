const { isAdmin } = require("../privileges");

module.exports = {
    name: "whoami",
    usage: "whoami",
    description: "responds with username (or bot admin if applicable)",
    action: (msg, cmdArgs) => {
        // Get name info for msg author
        let username = msg.author.username;
        let nickname = msg.member.nickname;
        const name = nickname ? nickname + " (" + username + ")": username;
        // Get whether user is bot admin or not
        const label = isAdmin(msg.author.id, cmdArgs[0]) ? "Bot Admin: " : "User: ";
        // Send the information
        msg.channel.send(label + name);
    },
}