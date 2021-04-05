module.exports = {
    name: "queen",
    usage: "queen",
    description: "adds reactions 🇬 1️⃣ 👸 to most recent message",
    action: async (msg, cmdArgs) => {
        await msg.channel.messages.fetch({limit: 2}).then(messages => {
            if(messages.size == 2) {
                const arr = messages.array();
                const reactions = ["🇬", "1️⃣", "👸"];
                reactions.forEach(r => arr[1].react(r).catch(console.log));
            }
        })
    }
}