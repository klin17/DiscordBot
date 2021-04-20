//imports
const fs = require('fs');


// returns original, with all the substrings matching replacee with replacewith
exports.strReplaceAll = (original, replacee, replacewith) => {
    let replaced = original.slice().replace(replacee, replacewith);
    if(replaced == original) {
        return original;
    } else {
        return exports.strReplaceAll(replaced, replacee, replacewith);
    }
}

// returns the substring of the original string after the arg <substring>
exports.strAfter = (original, substring, include=false) => {
	if(include) {
		return original.slice(original.indexOf(substring), original.length);
	}
	return original.slice(original.indexOf(substring) + substring.length, original.length);
}

// returns the substring following the last match for regex
exports.strAfterRegex = (original, regex) => {
	regex.test(original);
	return original.slice(regex.lastIndex, original.length);
}

// returns the index of the first char that matches regex
exports.regexIndexOf = (string, regex, startpos) => {
    var indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

// returns a random element of the array. Assumes arr.length > 0.
exports.pickRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

// sends a DM from bot to user
exports.dmUser = (userObj, content, options) => {
    if(userObj.dmChannel) {
        userObj.dmChannel.send(content, options);
    } else {
        userObj.createDM().then(channel => channel.send(content, options));
    }
}

exports.getCommands = () => {
    const commands = {};
    const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
    for(const f of commandFiles) {
        const commandObj = require(`./commands/${f}`);
        commands[commandObj.name] = commandObj;
    }
    return commands;
}

exports.getMilliseconds = (amount, unit) => {
    let num = parseFloat(amount);
    if(isNaN(num)) {
        return undefined;
    }
    switch(unit) {
        case "ms":
        case "millisecond":
        case "milliseconds":
            return num;
        case "s":
        case "seconds":
        case "sec":
        case "second":
            return num * 1000;
        case "hr":
        case "hrs":
        case "hour":
        case "hours":
            return num * 1000 * 60 * 60;
        default:
            // minutes
            return num * 1000 * 60;
    }
}