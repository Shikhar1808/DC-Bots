const { PermissionsBitField } = require('discord.js');
const db = require('../database/db');
const expenseTrackingChannels = {};

const startExpenseTracking = async (msg) => {
    console.log(msg.content);
    db.get(`SELECT channel_id FROM channels WHERE user_id = ?`, [msg.author.id], async (err, row) => {
        if (err) {
            console.error(err.message);
            return await msg.channel.send('An error occurred while checking your expense tracking channel.');
        }

        if (row) {
            const existingChannel = msg.guild.channels.cache.get(row.channel_id);
            if (existingChannel) {
                return await msg.channel.send('You have already started expense tracking and your expense tracking channel already exists!');
            } else {
                db.run(`DELETE FROM channels WHERE user_id = ?`, [msg.author.id], (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });
            }
        }

        try {
            const channel = await msg.guild.channels.create({
                name: `expense-tracking-${msg.author.username}`,
                type: 0,
                permissionOverwrites: [
                    {
                        id: msg.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: msg.author.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: msg.client.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    }
                ]
            });
            db.run(`INSERT INTO channels (user_id, channel_id) VALUES (?, ?)`, [msg.author.id, channel.id], (err) => {
                if (err) {
                    console.error(err.message);
                    return msg.channel.send('An error occurred while storing your expense tracking channel.');
                }
                expenseTrackingChannels[msg.author.id] = channel.id;
                return msg.channel.send(`Your expense tracking channel has been created! You can access it at ${channel}`);
            });
        } catch (err) {
            console.log(err);
            return await msg.channel.send('An error occurred while creating your expense tracking channel.');
        }
    });
}

process.on('exit', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
    });
});

module.exports = startExpenseTracking;
module.exports.expenseTrackingChannels = expenseTrackingChannels;
