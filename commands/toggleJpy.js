const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('togglejpy')
        .setDescription('Toggles the display of JPY to USD conversion'),
    async execute(interaction) {
        const settingsPath = path.join(__dirname, '..', 'settings.json');
        let settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

        // Toggle the setting
        settings.showJpyToUsd = !settings.showJpyToUsd;

        // Save the updated settings
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        await interaction.reply(`JPY to USD conversion display is now ${settings.showJpyToUsd ? 'enabled' : 'disabled'}.`);
    },
};
