
module.exports = {
    name: "echo",
    usage: "echo <message>",
    description: "bot replies with <message>",
    action: (msg, cmdArgs) => {
        // send the cmdArgs joined back as one string
        let resp = cmdArgs.join(" ");
        if(resp) {
            msg.channel.send(resp);
        }
    }
}