const { defaultBadArgResponse } = require("../botActions");
const { isPermAdmin, revokeAdmin } = require("../privileges");

module.exports = {
    name: "revoke",
    usage: "revoke (permanent) @<user>",
    description: "revokes admin privileges from <user> if they are not perm admin",
    restricted: true,
    action: (msg, cmdArgs) => {
        const user = msg.mentions.members.first();
        if(!user) {
            defaultBadArgResponse(msg, "revoke");
        } else if(user.id == msg.author.id) {
            msg.channel.send("Cannot revoke your own admin privileges");
        } else if(isPermAdmin(user.id)) {
            msg.channel.send("cannot revoke permanent admin privileges");
        } else {
            // decide if (permanent) arg is there
            let perm = false;
            if(cmdArgs[0] && cmdArgs[0] == "permanent"){
                perm = true;
            }
            if(revokeAdmin(user.id, perm)) {
                if(perm) {
                    msg.channel.send(`Revoked permissions for <@${user.id}> permanently`)
                } else {
                    msg.channel.send(`Revoked permissions for <@${user.id}>`)
                }
            }
        }
    }
}