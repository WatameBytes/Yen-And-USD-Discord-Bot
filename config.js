const frequencyChoices = [
    { name: '24 hours', value: '24hour' },
    { name: '12 hours', value: '12hour' },
    { name: '6 hours', value: '6hour' },
    { name: '4 hours', value: '4hour' },
    { name: '3 hours', value: '3hour' },
    { name: '2 hours', value: '2hour' },
    { name: 'Hourly', value: 'hourly' },
    { name: '30 minutes', value: '30min' },
    { name: '15 minutes', value: '15min' },
    { name: '5 minutes', value: '5min' },
    { name: '1 minute', value: '1min' }
];

function getUpdateInterval(frequency) {
    const intervals = {
        '24hour': 24 * 60 * 60 * 1000,
        '12hour': 12 * 60 * 60 * 1000,
        '6hour': 6 * 60 * 60 * 1000,
        '4hour': 4 * 60 * 60 * 1000,
        '3hour': 3 * 60 * 60 * 1000,
        '2hour': 2 * 60 * 60 * 1000,
        'hourly': 60 * 60 * 1000,
        '30min': 30 * 60 * 1000,
        '15min': 15 * 60 * 1000,
        '5min': 5 * 60 * 1000,
        '1min': 60 * 1000
    };
    return intervals[frequency] || 60 * 60 * 1000; // default to hourly
}

module.exports = {
    frequencyChoices,
    getUpdateInterval
};