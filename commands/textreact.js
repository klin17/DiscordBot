LETTER_EMOJIS = "🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿".split(" ")

module.exports = {
    name: "textreact",
    usage: "textreact text",
    description: "reacts with the letters in text to previous message, text must only be alphabetic and without repeated letters",
    action: async (msg, cmdArgs) => {
        if(cmdArgs.length != 1){
            msg.channel.send("Don't use multiple words for `textreact`");
            return;
        }
        text = cmdArgs[0].toLowerCase()
        // validate text
        valid = true;
        for(let c of text){
            if("abcdefghijklmnopqrstuvwxyz".includes(c) === false) {
                valid = false;
                break;
            }
        }
        if(!valid){
            msg.channel.send("Only use letters (no punctuation or emoji) for `textreact`");
            return;
        }

        let splittext = text.split("");
        let splitset = new Set(splittext)
        if (splittext.length != splitset.size) {
            msg.channel.send("Don't use repeat letters for `textreact`")
            return;
        }
        await msg.channel.messages.fetch({limit: 2}).then(messages => {
            if(messages.size == 2) {
                const arr = Array.from(messages.values());
                let prev_mess = arr[1]
                let command_mess = arr[0]

                for(let i in text){
                    let charcode = text.charCodeAt(i);
                    let position = charcode - 97;
                    prev_mess.react(LETTER_EMOJIS[position])
                }
                // command_mess.delete(); // remove this message
            }
        })
    }
}