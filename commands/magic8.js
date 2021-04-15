const { pickRandom } = require("../utils");

// 10 positives, 5 negatives, 5 noncommital, 1 fun
const magic8responses = [
    "As I see it, yes",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don’t count on it",
    "It is certain",
    "It is decidedly so",
    "Most likely",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Outlook good",
    "Reply hazy, try again",
    "Signs point to yes",
    "Very doubtful",
    "Without a doubt",
    "Yes",
    "Yes – definitely",
    "You may rely on it",
    "Owa owa", // just for fun
]

module.exports = {
    name: "magic8",
    usage: "magic8",
    description: "bot provides a magic 8 ball response",
    action: (msg, cmdArgs) => {
        msg.channel.send("Magic 8 Ball says: " + pickRandom(magic8responses));
    }
}