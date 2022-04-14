

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
// const { clientId, guildId, token } = require('./config.json');
const process = require('process');
require('dotenv').config();
const token = process.env.DISCORD_TOKEN
const clientId = process.env.CLIENT_ID
const guildId = process.env.GUILD_ID

// const commands = [
// 	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
// 	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
// 	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
// ].map(command => command.toJSON());
const commandsDir = "./slashCommands";
const commands = [];
const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

console.log("Loading slash commands...")
for (const file of commandFiles) {
    console.log(`${file} loaded`);
	const command = require(`${commandsDir}/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);
// console.log(rest.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();