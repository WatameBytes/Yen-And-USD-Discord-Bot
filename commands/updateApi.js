const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { frequencyChoices, getUpdateInterval } = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updateapi')
        .setDescription('Updates the API update frequency')
        .addStringOption(option =>
            option.setName('frequency')
                .setDescription('The new API update frequency')
                .setRequired(true)
                .addChoices(...frequencyChoices)),
    async execute(interaction) {
        const newFrequency = interaction.options.getString('frequency');
        const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
       
        settings.apiUpdateFrequency = newFrequency;
        fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2));
        const rateCommand = interaction.client.commands.get('rate');
        rateCommand.initializeRates();
        await interaction.reply(`API update frequency has been set to ${newFrequency}.`);
    },
};