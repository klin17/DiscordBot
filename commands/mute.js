module.exports = {
    name: "mute",
    usage: "mute @<person>",
    description: "gives <person> the Muted roll",
    restricted: true,
    action: (msg, cmdArgs) => {
        
        const mutee = msg.mentions.members.first();
        const muteeAsGuildMember = msg.guild.members.fetch(mutee);
        if(!mutee) {
            msg.channel.send("Don't forget to mention the person you want to mute");
        } else {
            const muterole = msg.guild.roles.cache.find(x => x.name === "Muted");
            if(!muterole) {
                msg.channel.send("This server do not have role with name `Muted`");
            } else if(mutee.roles.cache.has(muterole)) {
                msg.channel.send("Given User is already muted")
            } else if(msg.guild.member(mutee).hasPermission("ADMINISTRATOR")){
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
        }
    },
}