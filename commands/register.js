const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers the current channel for rate updates'),
    async execute(interaction) {
        const channelId = interaction.channelId;
        const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
        
        settings.registeredChannelId = channelId;
        
        fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2));
        
        await interaction.reply(`This channel (ID: ${channelId}) has been registered for rate updates.`);
    },
};