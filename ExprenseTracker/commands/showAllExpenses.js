const { EmbedBuilder } = require('discord.js');

const db = require('../database/db');

const showAllExpenses = async (message) => {
    db.all(`SELECT * FROM expenses WHERE user = ?`, [message.author.id], (err, rows) => {
        if (err) {
            console.error(err.message);
            return message.channel.send('An error occurred while fetching your expenses or there are no expense added.');
        }

        if (!rows.length || rows.length === 0) {
            return message.channel.send('You have not added any expenses yet.');
        }

        const expensesByMonth = {};
        rows.forEach((row) => {
            const date = row.date.split('-');

            const monthKey = `${date[0]}-${date[1]}`;
            if (!expensesByMonth[monthKey]) {
                expensesByMonth[monthKey] = {
                    days: {},
                    total: 0
                };
            }

            const day = date[2];
            if (!expensesByMonth[monthKey].days[day]) {
                expensesByMonth[monthKey].days[day] = {
                    entries: [],
                    total: 0
                };
            }

            expensesByMonth[monthKey].days[day].entries.push(row);
            expensesByMonth[monthKey].days[day].total += row.amount;
            expensesByMonth[monthKey].total += row.amount;
        });

        const embed = new EmbedBuilder()
            .setTitle('Your Expenses')
            .setDescription('Here are your expenses by month:')
            .setColor('#D4E932');

        Object.keys(expensesByMonth).forEach(monthKey => {
            const monthData = expensesByMonth[monthKey];
            let monthDescription = `Total Expense: ₹${monthData.total.toFixed(2)}\n\n`;

            Object.keys(monthData.days).forEach(dayKey => {
                const dayData = monthData.days[dayKey];
                let dayDescription = `Total Expense: ₹${dayData.total.toFixed(2)}\n`;

                dayData.entries.forEach(entry => {
                    dayDescription += `₹${entry.amount.toFixed(2)} - ${entry.description}\n`;
                });

                monthDescription += `**${dayKey}**\n${dayDescription}\n`;
            });

            embed.addFields({ name: monthKey, value: monthDescription });
        });

        message.channel.send({ embeds: [embed] });
    });



}

module.exports = showAllExpenses;