const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { frequencyChoices, getUpdateInterval } = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('postfreq')
        .setDescription('Updates the post frequency')
        .addStringOption(option =>
            option.setName('frequency')
                .setDescription('The new post frequency')
                .setRequired(true)
                .addChoices(...frequencyChoices)),
    async execute(interaction) {
        const newFrequency = interaction.options.getString('frequency');
        const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
       
        settings.postFrequency = newFrequency;
        fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2));
        const rateCommand = interaction.client.commands.get('rate');
        rateCommand.scheduleNextUpdate(interaction.client);
        await interaction.reply(`Post frequency has been set to ${newFrequency}.`);
    },
};