module.exports = {
    name: "sadreact",
    usage: "sadreact",
    description: "adds a sad react to previous message",
    action: async (msg, cmdArgs) => {
        await msg.channel.messages.fetch({limit: 2}).then(messages => {
            if(messages.size == 2) {
                const arr = messages.array();
                arr[0].delete();
                arr[1].react(`😢`);
            }
        })
    }
}