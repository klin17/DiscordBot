const plantEmoji = '🪴';

module.exports = {
    name: "plontey",
    usage: "plontey",
    description: `bot reacts with ${plantEmoji} to most recent message`,
    action: async (msg, cmdArgs) => {
        await msg.channel.messages.fetch({limit: 2}).then(messages => {
            if(messages.size == 2) {
                const arr = messages.array();
                arr[1].react(plantEmoji).catch(console.log);
            }
        })
    }
}