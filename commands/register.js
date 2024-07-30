const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers the current channel for rate updates'),
    async execute(interaction) {
        const channelId = interaction.channelId;
        const channelIdsPath = path.join(__dirname, '..', 'channelIds.txt');

        // Create file if it doesn't exist
        if (!fs.existsSync(channelIdsPath)) {
            fs.writeFileSync(channelIdsPath, '');
        }

        // Read existing channel IDs
        let channelIds = fs.readFileSync(channelIdsPath, 'utf8').split('\n').filter(id => id.trim() !== '');

        // Add new channel ID if it's not already in the list
        if (!channelIds.includes(channelId)) {
            channelIds.push(channelId);
            fs.writeFileSync(channelIdsPath, channelIds.join('\n'));
            await interaction.reply(`This channel (ID: ${channelId}) has been registered for rate updates.`);
        } else {
            await interaction.reply(`This channel (ID: ${channelId}) is already registered for rate updates.`);
        }
    },
};