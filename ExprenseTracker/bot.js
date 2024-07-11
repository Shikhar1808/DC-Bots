require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const db = require('./database/db');

const startExpenseTracking = require('./commands/startExpenseTracking');
const { expenseTrackingChannels } = require('./commands/startExpenseTracking');
const addexpense = require('./commands/addExpense');
const showAllExpenses = require('./commands/showAllExpenses');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
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

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();
    
    const userChannelID = expenseTrackingChannels[message.author.id];
    const userChannel = message.guild.channels.cache.get(userChannelID);
    
    switch (command) {
        case '!startexpensetracking':
            await startExpenseTracking(message);
            if (!userChannelID) {
                return message.channel.send('You have not started expense tracking yet. Use the command `!startExpenseTracking` to start expense tracking.');
            }
            break;
    
        case '!addexpense':
            if (!userChannelID || !userChannel || message.channel.id !== userChannelID) {
                return message.channel.send(`You are not allowed to use this command in this channel. Please use your expense tracking channel.${userChannel?userChannel:"If not created, create the one using `!startExpenseTracking`"} ` );
            }
            await addexpense(message, db);
            break;
    
        case '!showallexpenses':
            if (!userChannelID || !userChannel || message.channel.id !== userChannelID) {
                return message.channel.send(`You are not allowed to use this command in this channel. Please use your expense tracking channel. ${userChannel?userChannel:"If not created, create the one using `!startExpenseTracking`"}`);
            }
            await showAllExpenses(message, db);
            break;
    
        case '!deleteexpense':
        case '!acountmoney':
        case '!moneyreceived':
            console.log('This command is not implemented yet.');
            break;
    
        default:
            break;
    }
});

client.login(process.env.BOT_TOKEN);
