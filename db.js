const sqlite3 = require("sqlite3").verbose();

// データベースの接続
const db = new sqlite3.Database("./mydb.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

// テーブルの作成
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    ip TEXT NOT NULL,
    takara TEXT
  )`);
});

module.exports = db;
