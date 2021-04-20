module.exports = {
    name: "unmute",
    usage: "unmute @<person>",
    description: "removes the Muted role from <person>",
    restricted: true,
    action: (msg, args) => {
        const user = msg.mentions.members.first();
        let muterole = msg.guild.roles.cache.find(x => x.name === "Muted")
        if(muterole) {
            if(msg.guild.member(mutee).roles.cache.has(muterole.id)) {
                user.roles.remove(muterole);
                msg.channel.send(`Unmuted <@${mutee.id}>`);
            } else {
                msg.channel.send("Cannot unmute someone who is not muted");
            }
        } else {
            msg.channel.send("The 'Muted' role does not exist");
        }
    },
}