
module.exports = {
    name: "shialabeouf",
    regexStrings: ["s+h+i+a+ +l+a+b+e+o+u+f+", "gi"],
    description: "Responds with 'JUST DO IT'",
    restricted: false,
    action: (msg) => {
        msg.channel.send("JUST DO IT");
    },
}

/*
"shia labeouf": {
        regexStrings: ["s+h+i+a+ +l+a+b+e+o+u+f+", "gi"],
        action: (msg) => {
            msg.channel.send("JUST DO IT");
        }
    },
*/