const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getUpdateInterval } = require('../config');

let exchangeRates = {
    USDTOJPY: null,
    JPYTOUSD: null,
    lastUpdated: null
};

function getSettings() {
    const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    if (typeof settings.showJpyToUsd === 'undefined') {
        settings.showJpyToUsd = true; // Default to showing JPY to USD
    }
    return settings;
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
    const channelIdsPath = path.join(__dirname, '..', 'channelIds.txt');
    
    if (!fs.existsSync(channelIdsPath)) {
        console.log('No channels registered for updates.');
        return;
    }

    const channelIds = fs.readFileSync(channelIdsPath, 'utf8').split('\n').filter(id => id.trim() !== '');

    if (channelIds.length === 0) {
        console.log('No channels registered for updates.');
        return;
    }

    const embed = createRateEmbed();

    channelIds.forEach(channelId => {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        } else {
            console.log(`Channel not found: ${channelId}`);
        }
    });
}

function createRateEmbed() {
    const settings = getSettings();
    const usdToJpy = exchangeRates.USDTOJPY.toFixed(2);
    const jpyToUsd = exchangeRates.JPYTOUSD.toFixed(6);
    const lastUpdated = exchangeRates.lastUpdated.toLocaleString();

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📊 Current Exchange Rates')
        .setDescription('Current state of USD/JPY exchange rates')
        .addFields(
            { name: '🇺🇸 USD to JPY 🇯🇵', value: `$1.00 USD = ¥${usdToJpy} JPY`, inline: false }
        )
        .setFooter({ text: `Last updated: ${lastUpdated}` })
        .setTimestamp()
        .setThumbnail('https://example.com/currency-icon.png');

    if (settings.showJpyToUsd) {
        embed.addFields(
            { name: '🇯🇵 JPY to USD 🇺🇸', value: `¥1 JPY = $${jpyToUsd} USD`, inline: false }
        );
    }

    return embed;
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
    
        // Clear existing timeout
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    
        // Calculate time until next aligned interval
        const now = new Date();
        const delay = interval - (now.getTime() % interval);
    
        this.updateTimeout = setTimeout(() => {
            this.sendRateUpdate(client);
            this.scheduleNextUpdate(client);
        }, delay);
    },
    initializeRates() {
        const settings = getSettings();
        const apiInterval = getUpdateInterval(settings.apiUpdateFrequency);
    
        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    
        // Perform initial update
        this.updateExchangeRates();
    
        // Calculate time until next aligned interval
        const now = new Date();
        const delay = apiInterval - (now.getTime() % apiInterval);
    
        // Set timeout for first aligned update
        setTimeout(() => {
            this.updateExchangeRates();
            // Then set interval for subsequent updates
            this.updateInterval = setInterval(this.updateExchangeRates, apiInterval);
        }, delay);
    }
};