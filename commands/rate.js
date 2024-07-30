const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

let exchangeRates = {
    USDTOJPY: null,
    JPYTOUSD: null,
    lastUpdated: null
};

function getSettings() {
    return JSON.parse(fs.readFileSync('settings.json', 'utf8'));
}

function getUpdateInterval(frequency) {
    switch(frequency) {
        case 'hourly': return 60 * 60 * 1000;
        case '30min': return 30 * 60 * 1000;
        case '15min': return 15 * 60 * 1000;
        case '5min': return 5 * 60 * 1000;
        case '1min': return 60 * 1000;  // New 1-minute option
        default: return 60 * 60 * 1000; // default to hourly
    }
}

async function updateExchangeRates() {
    try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const rates = response.data.rates;
        exchangeRates.USDTOJPY = rates.JPY;
        exchangeRates.JPYTOUSD = 1 / rates.JPY;
        exchangeRates.lastUpdated = new Date();
        console.log('Exchange rates updated:', exchangeRates);
    } catch (error) {
        console.error('Error updating exchange rates:', error);
    }
}

function sendRateUpdate(client) {
    const settings = getSettings();
    const channelId = settings.registeredChannelId;
   
    if (!channelId) {
        console.log('No channel registered for updates.');
        return;
    }
   
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.log('Registered channel not found.');
        return;
    }
   
    const embed = createRateEmbed();
    channel.send({ embeds: [embed] });
}

function createRateEmbed() {
    const usdToJpy = exchangeRates.USDTOJPY.toFixed(2);
    const jpyToUsd = exchangeRates.JPYTOUSD.toFixed(6);
    const lastUpdated = exchangeRates.lastUpdated.toLocaleString();

    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Current Exchange Rates')
        .addFields(
            { name: 'USD to JPY', value: `$1.00 USD = ¥${usdToJpy} JPY`, inline: true },
            { name: 'JPY to USD', value: `¥1 JPY = $${jpyToUsd} USD`, inline: true },
        )
        .setFooter({ text: `Last updated: ${lastUpdated}` })
        .setTimestamp();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rate')
        .setDescription('Displays current USD to JPY and JPY to USD exchange rates'),
    async execute(interaction) {
        if (!exchangeRates.USDTOJPY || !exchangeRates.JPYTOUSD) {
            await interaction.reply('Sorry, exchange rate data is not available at the moment. Please try again later.');
            return;
        }
        const embed = createRateEmbed();
        await interaction.reply({ embeds: [embed] });
    },
    updateExchangeRates,
    sendRateUpdate,
    scheduleNextUpdate(client) {
        const settings = getSettings();
        const interval = getUpdateInterval(settings.postFrequency);
        setTimeout(() => {
            this.sendRateUpdate(client);
            this.scheduleNextUpdate(client);
        }, interval);
    },
    initializeRates() {
        const settings = getSettings();
        const apiInterval = getUpdateInterval(settings.apiUpdateFrequency);
        this.updateExchangeRates();
        setInterval(this.updateExchangeRates, apiInterval);
    }
};