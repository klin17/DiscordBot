const { pickRandom } = require("../utils");


module.exports = {
    name: "bonk",
    regexStrings: ["b+o+n+k+!*", "gi"],
    // description: "@s someone random in the server",
    // restricted: false,
    action: (msg) => {
        // send a bonk image (gif of a cat)
        const bonks = [
            "https://tenor.com/view/guillotine-bonk-revolution-gif-20305805",
            "https://tenor.com/view/bonk-gif-18272416",
        ]
        msg.channel.send(pickRandom(bonks));
    },
}