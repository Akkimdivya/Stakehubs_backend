const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('order_management.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS PendingOrderTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_qty INTEGER NOT NULL,
        buyer_price REAL NOT NULL,
        seller_price REAL NOT NULL,
        seller_qty INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS CompletedOrderTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        price REAL NOT NULL,
        qty INTEGER NOT NULL
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_buyer_price ON PendingOrderTable (buyer_price)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_seller_price ON PendingOrderTable (seller_price)`);
});

db.close();
