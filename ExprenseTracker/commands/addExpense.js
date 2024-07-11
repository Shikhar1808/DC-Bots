const db = require('../database/db');

const addexpense = async (message,db) => {
    console.log(message.content);
    const [amount, ...descriptionArr] = message.content.split(' ').slice(1);
    const description = descriptionArr.join(' ');
    const entryDate = new Date().toISOString().split('T')[0];

    console.log(entryDate);

    if (!amount || isNaN(amount) || !description) {
        return await message.channel.send('Please provide a valid amount and description. Example: `!addexpense 20 Lays ke chips`');
    }

    db.run(`INSERT INTO expenses (user, amount, description, date) VALUES (?, ?, ?, ?)`, [message.author.id, amount, description, entryDate], (err) => {
        if (err) {
            console.error(err.message);
            return message.channel.send('An error occurred while adding your expense.');
        }
        return message.channel.send('Your expense has been added successfully!');
    });
}

module.exports = addexpense;