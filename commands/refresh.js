const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Refreshes the bot to apply new channel registrations'),
    async execute(interaction, client) {
        await interaction.deferReply();

        // Re-initialize rates and schedule updates
        const rateCommand = client.commands.get('rate');
        rateCommand.initializeRates();
        rateCommand.scheduleNextUpdate(client);

        await interaction.editReply('Bot refreshed. New channel registrations have been applied.');
    },
};