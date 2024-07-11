const sqlite3 = require('sqlite3').verbose();

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

module.exports = db;
