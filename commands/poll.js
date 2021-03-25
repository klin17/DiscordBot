const { defaultBadArgResponse } = require("../botActions");

module.exports = {
    name: "poll",
    usage: 'poll "question to ask" "item1" "item2"...',
    description: "creates reaction poll using parameters, up to 10 items",
    action: async (msg, cmdArgs) => {
        // poll needs different splitting, convert to expected
        cmdArgs = [" "].concat(cmdArgs).join(" ").split(/\s+"/);
        cmdArgs.shift();

        if(cmdArgs.length > 2 && cmdArgs.length <= 11) {
            // function for removing ending quotation mark
            const withoutLast = (s) => s.substring(0, s.length - 1);
            // function for getting boxed number emojis (1) => 2
            const getNumEmoji = (i) => String.fromCharCode(49+i, 0xFE0F, 0x20E3)
            // Generate poll as a string
            const question = withoutLast(cmdArgs.shift());
            let pollString = cmdArgs.reduce(
                (acc, e, i) => acc + '\n-' + getNumEmoji(i) + ' ' + withoutLast(e), 
                question
            );
            // Send the pollstring and add reactions
            await msg.channel.send(pollString).then(sentMessage => {
                cmdArgs.forEach((val, i) => sentMessage.react(getNumEmoji(i)));
                msg.delete({ timeout: 1500 }).catch(console.error);
            });
        } else {
            defaultBadArgResponse(msg, "poll");
        }
    }
}