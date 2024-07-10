require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const startExpenseTracking = require('./commands/startExpenseTracking');
const { expenseTrackingChannels } = require('./commands/startExpenseTracking');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const db = new sqlite3.Database('./expenses.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the expenses database.');
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS channels (
            user_id TEXT PRIMARY KEY,
            channel_id TEXT NOT NULL
        )`);
    }
});

const loadChannels = () => {
    db.all(`SELECT user_id, channel_id FROM channels`, (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        rows.forEach((row) => {
            const channel = client.channels.cache.get(row.channel_id);
            if (channel) {
                expenseTrackingChannels[row.user_id] = row.channel_id;
            } else {
                db.run(`DELETE FROM channels WHERE user_id = ?`, [row.user_id], (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });
            }
        });
        console.log('Loaded channels:', expenseTrackingChannels);
    });
};

client.once('ready', () => {
    console.log('Bot is online!');
    loadChannels();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === '!startexpensetracking') {
        await startExpenseTracking(message);
        return;
    }

    const userChannelID = expenseTrackingChannels[message.author.id];
    if (!userChannelID) {
        return message.channel.send('You have not started expense tracking yet. Use the command `!startExpenseTracking` to start expense tracking.');
    }

    const userChannel = message.guild.channels.cache.get(userChannelID);
    if (!userChannel || message.channel.id !== userChannelID) {
        return message.channel.send('You are not allowed to use this command in this channel.');
    }

    if (command === '!addexpense') {
        message.channel.send('The command is not in use.');
    }
});

client.login(process.env.BOT_TOKEN);
