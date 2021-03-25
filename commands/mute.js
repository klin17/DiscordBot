module.exports = {
    name: "mute",
    usage: "mute @<person>",
    description: "gives <person> the Muted roll",
    restricted: true,
    action: (msg, cmdArgs) => {
        const mutee = msg.mentions.members.first();
        if(!mutee) {
            msg.channel.send("Don't forget to mention the person you want to mute");
        } else if (mutee.id == msg.author.id) {
            msg.channel.send("You cannot mute yourself");
        } else {
            const muterole = msg.guild.roles.cache.find(x => x.name === "Muted");
            if(!muterole) {
                msg.channel.send("This server do not have role with name `Muted`");
            } else if(mutee.roles.cache.has(muterole)) {
                msg.channel.send("Given User is already muted")
            } else {
                mutee.roles.add(muterole)
                msg.channel.send(`Muted <@${mutee.id}>`)
            }
        }
    },
}