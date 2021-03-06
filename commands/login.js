const { getPermAdminIDs, isPermAdmin, isAdmin } = require("../privileges");
const { dmUser } = require("../utils");

module.exports = {
    name: "login",
    usage: "login <password>",
    description: "logs in as bot admin for 5 min if <password> correct",
    action: (msg, cmdArgs) => {
        if(isPermAdmin(msg.author.id)) {
            msg.channel.send("User is already permanent admin");
        } else if(cmdArgs[0] && isAdmin(msg.author.id, cmdArgs[0])) {
            msg.delete();
            msg.channel.send(`User <@${msg.author.id}> has bot admin privileges for 5 min`)
            msg.channel.send("User has bot admin privileges for 5 min");

            // Get name info for msg author
            let username = msg.author.username;
            let nickname = msg.member.nickname;
            const name = nickname ? nickname + " (" + username + ")": username;

            // DM permadmins that someone logged in
            let permadminids = getPermAdminIDs();
            permadminids.forEach(id => {
                msg.client.users.fetch(id).then(permadmin => {
                    dmUser(permadmin, `${name} logged in as admin`);
                });
            })
        } else {
            msg.channel.send("Incorrect password");
        }
    },
}