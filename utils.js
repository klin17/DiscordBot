//imports
const Discord = require('discord.js'); // For types
const { CustomCommand } = require('./commands/commandTypes')
const fs = require('fs');

/**
 * @param {String} original 
 * @param {String} replacee 
 * @param {String} replacewith 
 * @returns {String} original but with all the substrings matching replacee with replacewith
 */
exports.strReplaceAll = (original, replacee, replacewith) => {
    let replaced = original.slice().replace(replacee, replacewith);
    if(replaced == original) {
        return original;
    } else {
        return exports.strReplaceAll(replaced, replacee, replacewith);
    }
}

// returns the substring of the original string after the arg <substring>
/**
 * @param {String} original The string to look at
 * @param {String} substring The substring to look for
 * @param {boolean} [include=false] Whether to include the substring or not
 * @returns {String} a slice of the original string which comes after the given substring
 */
exports.strAfter = (original, substring, include=false) => {
	if(include) {
		return original.slice(original.indexOf(substring), original.length);
	}
	return original.slice(original.indexOf(substring) + substring.length, original.length);
}

/**
 * @param {String} original The string to look through
 * @param {RegExp} regex The regex object to use in the search
 * @returns {String} the substring of the original following the last match of the regex
 */
exports.strAfterRegex = (original, regex) => {
	regex.test(original);
	return original.slice(regex.lastIndex, original.length);
}

/**
 * @param {String} string The original string
 * @param {RegExp} regex The regex object to use in search
 * @param {Number} startpos The index of the string to start searching from
 * @returns {Number} the index of the first char of the string that matches the regex
 */
exports.regexIndexOf = (string, regex, startpos) => {
    var indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

/**
 * 
 * @param {T[]} arr The array to pick from
 * @returns {T} a random element of the array. Assumes arr.length > 0.
 */
exports.pickRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * sends a DM to the given user
 * 
 * @param {Discord.User} userObj The user object representing who to send a DM to
 * @param {String} content The message to send to the user
 * @param {string | Discord.MessagePayload | Discord.MessageOptions} options The options object for sending
 */
exports.dmUser = (userObj, content, options) => {
    if(userObj.dmChannel) {
        userObj.dmChannel.send(content, options);
    } else {
        userObj.createDM().then(channel => channel.send(content, options));
    }
}

/**
 * 
 * @returns { {[commandName: String]: CustomCommand } } An object of all command objects
 */
exports.getCommands = () => {
    const commands = {};
    const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
    for(const f of commandFiles) {
        const commandObj = require(`./commands/${f}`);
        commands[commandObj.name] = commandObj;
    }
    return commands;
}

/**
 * 
 * @param {[String, String]} regexOptions The regex string followed by a string of flags
 * @returns {RegExp} A regex object using those options
 */
exports.makeRegex = ([s, flags]) => {
    return new RegExp(s, flags);
}

/**
 * 
 * @returns {Object} An object with all keywords in it
 */
exports.getKeywords = () => {
    const keywords = {};
    const keywordFiles = fs.readdirSync('./keywords').filter(f => f.endsWith('.js'));
    for(const f of keywordFiles) {
        const keywordObj = require(`./keywords/${f}`);
        keywords[keywordObj.name] = keywordObj;
    }
    return keywords;
}

/**
 * 
 * @param {Number} amount The quantity
 * @param {String} unit The unit of time
 * @returns {Number} The amount of that unit converted into milliseconds
 */
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
