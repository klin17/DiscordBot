const { pickRandom } = require("../utils");

module.exports = {
    name: "atrandom",
    usage: "atRandom",
    description: "@s someone random in the server",
    restricted: true,
    action: (msg, cmdArgs) => {
        // get all members of guild
        msg.guild.members.fetch().then(members => {
            // filter out the bots
            let humans = [];
            members.forEach(m => {
                if(!m.user.bot) {
                    humans.push(m.user);
                }
            })
            // @ random choice from users
            let randID = pickRandom(humans).id;
            msg.channel.send(`HI <@${randID}>`);
        });
    },
}