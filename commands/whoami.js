const { isAdmin } = require("../privileges");

module.exports = {
    name: "whoami",
    usage: "whoami (full)",
    description: "responds with UserType: username/nickname, includes ID if (full)",
    action: (msg, cmdArgs) => {
        // Get name info for msg author
        let username = msg.author.username;
        let nickname = msg.member.nickname;
        const name = nickname ? nickname + " (" + username + ")": username;
        // Get whether user is bot admin or not
        const label = isAdmin(msg.author.id, cmdArgs[0]) ? "Bot Admin: " : "User: ";
        
        const id = cmdArgs[0] == "full" ? " -- " + msg.author.id : "";
        // Send the information
        msg.channel.send(label + name + id);
    },
}