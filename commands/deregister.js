const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deregister')
        .setDescription('Deregisters the current channel from rate updates'),
    async execute(interaction) {
        const channelId = interaction.channelId;
        const channelIdsPath = path.join(__dirname, '..', 'channelIds.txt');

        if (!fs.existsSync(channelIdsPath)) {
            await interaction.reply('No channels are currently registered.');
            return;
        }

        let channelIds = fs.readFileSync(channelIdsPath, 'utf8').split('\n').filter(id => id.trim() !== '');

        if (channelIds.includes(channelId)) {
            channelIds = channelIds.filter(id => id !== channelId);
            fs.writeFileSync(channelIdsPath, channelIds.join('\n'));
            await interaction.reply(`This channel (ID: ${channelId}) has been deregistered from rate updates.`);
        } else {
            await interaction.reply(`This channel (ID: ${channelId}) was not registered for rate updates.`);
        }
    },
};