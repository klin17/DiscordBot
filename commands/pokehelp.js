const { setPokeHelp, getPokeHelp, checkedPokeHelp, sayClosest, pokeUpdate } = require("../pokeutils");
const { isAdmin } = require("../privileges");

module.exports = {
    name: "pokehelp",
    usage: "pokehelp (on/off/toggle | link <imageurl> | update <name> <imageurl>)",
    description: "Switches pokehelp, finds closest to <imageurl> or updates <name> to use <imageurl>",
    action: (msg, cmdArgs) => {
        let arg = cmdArgs[0];
        let argexists = false;
        const sayPokehelp = (set) => {
            msg.channel.send(`Pokemon help is ${set ? "now " : ""}${getPokeHelp() ? "active" : "inactive"}`);
        }
        if(arg) {
            if(arg == "link") {
                if(!cmdArgs[1]) {
                    msg.channel.send("pokehelp link requires <imageurl>");
                    return;
                }
                sayClosest(cmdArgs[1], msg.channel);
                return; // don't say value of pokehelp after checkedPokeHelp() call
            }
            if(arg == "update") {
                if(!cmdArgs[1] || !cmdArgs[2]) {
                    msg.channel.send("pokehelp update requires <name> and <imageurl>");
                    return;
                }
                if(!isAdmin(msg.author.id)) {
                    msg.channel.send("Only botadmin can use $pokehelp update");
                    return;
                }
                pokeUpdate(cmdArgs[1], cmdArgs[2], msg.channel);
                return;
            }
            argexists = true;
            if(arg == "on") {
                setPokeHelp(true);
            } else if(arg == "off") {
                setPokeHelp(false);
            } else if(arg == "toggle"){
                getPokeHelp() ? setPokeHelp(false) : setPokeHelp(true);
            }
        }
        sayPokehelp(argexists);
    }
}