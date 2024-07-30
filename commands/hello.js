const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Greets the user with a simple message'),
    async execute(interaction) {
        await interaction.reply(`Hello, ${interaction.user.username}!`);
    },
};
