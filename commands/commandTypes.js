const Discord = require('discord.js'); // For types

/**
 * The Command object for non-slash commands
 * 
 * @typedef {Object} CustomCommand
 * @property {String} name The name of the command (lower case)
 * @property {String} usage The usage string for the command
 * @property {String} description A human readable description of the command
 * @property {boolean?} restricted Whether the command is restricted or not
 * @property {(msg: Discord.Message<boolean>, cmdArgs: String[]) => undefined} action Hello world
 */
