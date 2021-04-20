const { getMilliseconds } = require("../utils");

module.exports = {
    name: "mute",
    usage: "mute (n (units)) @<person>",
    description: "gives <person> the Muted roll for n (units) or min by default or indefinitely if n not provided",
    restricted: true,
    action: (msg, cmdArgs) => {
        const mutee = msg.mentions.members.first();
        const muteeMember = msg.guild.member(mutee);
        if(!mutee) {
            msg.channel.send("Don't forget to mention the person you want to mute");
        } else {
            const muterole = msg.guild.roles.cache.find(x => x.name === "Muted");
            if(!muterole) {
                msg.channel.send("This server do not have role with name `Muted`");
            } else if(muteeMember.roles.cache.has(muterole.id)) {
                msg.channel.send("Given User is already muted")
            } else if(muteeMember.hasPermission("ADMINISTRATOR")){
                msg.channel.send("Cannot mute server admins");
            } else {
                // update permissions for all channels of guild
                for(let gchannel of msg.guild.channels.cache.array()) {
                    gchannel.updateOverwrite(muterole, {
                        SEND_MESSAGES: false, SPEAK: false,
                    }).catch(console.error);
                }
                mutee.roles.add(muterole)
                msg.channel.send(`Muted <@${mutee.id}>`)
            }
            // set timer to unmute
            if(cmdArgs.length >= 2) {
                let time = getMilliseconds(cmdArgs[0], cmdArgs[1]);
                setTimeout(() => {
                    // don't use above muteeMember since status may have changed
                    if(msg.guild.member(mutee).roles.cache.has(muterole.id)) {
                        mutee.roles.remove(muterole);
                        msg.channel.send(`Unmuted <@${mutee.id}>`);
                    }
                }, time);
            }
        }
    },
}