require('dotenv').config();
const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    try {
        console.log(`Logged in as ${client.user.tag}!`);
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        console.log('Started refreshing application (/) commands.');

        const guilds = await client.guilds.fetch(); // Fetch all guilds the bot is part of
        let counter = 0;

        for (const [guildId, guild] of guilds) {
            try {
                console.log(`Deploying commands to guild ${guild.name} (${guildId})`);
                const data = await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                    { body: commands },
                );
                console.log(`Successfully reloaded ${data.length} application (/) commands in ${guild.name}.`);
                counter++;
            } catch (error) {
                console.error(`Error deploying commands to guild ${guild.name}: ${error}`);
            }
        }

        console.log(`Finished deploying commands to all guilds. Total guilds: ${counter}`);
    } catch (error) {
        console.error('An error occurred during the deployment process:', error);
    } finally {
        client.destroy(); // Disconnect the bot after deploying
    }
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Failed to log in:', error);
});
