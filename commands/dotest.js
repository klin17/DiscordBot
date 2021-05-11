

module.exports = {
    name: "dotest",
    usage: "dotest",
    description: "runs a functionality that is being tested",
    restricted: true,
    action: (msg, cmdArgs) => {
        msg.channel.send("No test currently");
    },
}