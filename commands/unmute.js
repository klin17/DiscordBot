module.exports = {
    name: "unmute",
    usage: "unmute @<person>",
    description: "removes the Muted role from <person>",
    restricted: true,
    action: (msg, args) => {
        const user = msg.mentions.members.first();
        let muterole = msg.guild.roles.cache.find(x => x.name === "Muted")
        if(muterole) {
            user.roles.remove(muterole)
        }
    },
}