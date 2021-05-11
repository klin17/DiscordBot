const { setPokeHelp, getPokeHelp, checkedPokeHelp } = require("../pokeutils");

module.exports = {
    name: "pokehelp",
    usage: "pokehelp (on/off/toggle | link <imageurl>)",
    description: "Says whether pokehelp is on/off, or toggles pokehelp, or finds closest pokemon to <imageurl>",
    action: (msg, cmdArgs) => {
        let arg = cmdArgs[0];
        let argexists = false;
        const sayPokehelp = (set) => {
            msg.channel.send(`Pokemon help is ${set ? "now " : ""}${getPokeHelp() ? "active" : "inactive"}`);
        }
        if(arg) {
            if(arg == "link" && cmdArgs[1]) {
                checkedPokeHelp(cmdArgs[1], msg.channel);
                return; // don't say value of pokehelp after checkedPokeHelp() call
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