const { pickRandom } = require("../utils");

module.exports = {
    name: "atrandom",
    usage: "atRandom",
    description: "@s someone random in the server",
    restricted: true,
    action: (msg, cmdArgs) => {
        // get all members of guild
        msg.guild.members.fetch().then(members => {
            // filter out the bots then get a random member
            const rando = members.filter(m => !m.user.bot).random();
            let randID = rando.id;
            msg.channel.send(`HI <@${randID}>`);
        });
    },
}