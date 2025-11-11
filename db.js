const Database = require("better-sqlite3");

const db = new Database(
  pathJoin("https://93fd1bqlftu6xjna.public.blob.vercel-storage.com/data.db")
);

function pathJoin(file) {
  // Ensure DB file resolves relative to project root
  const path = require("path");
  return path.join(__dirname, file);
}

function init() {
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      odds REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bets (
      id INTEGER PRIMARY KEY,
      bettor_first_name TEXT NOT NULL,
      bettor_last_name TEXT NOT NULL,
      player_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payout REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);

  const countRow = db.prepare("SELECT COUNT(*) as c FROM players").get();
  if (countRow.c === 0) {
    const seedPlayers = [
      { name: "Berfin DOĞAN", odds: 3.2 },
      { name: "Burcu ATEŞ", odds: 3.0 },
      { name: "Edanur ZENGİNCE", odds: 3.4 },
      { name: "Eren KARAYAPRAK", odds: 1.6 },
      { name: "Muzaffer EYLENCE", odds: 1.4 },
      { name: "Onur ATICI", odds: 1.5 },
      { name: "Selen KAYA", odds: 3.2 },
      { name: "Oyuncu 8", odds: 5.1 },
    ];
    const insert = db.prepare("INSERT INTO players (name, odds) VALUES (?, ?)");
    const insertMany = db.transaction((players) => {
      for (const p of players) insert.run(p.name, p.odds);
    });
    insertMany(seedPlayers);
  }
}

init();

function getPlayers() {
  return db.prepare("SELECT id, name, odds FROM players ORDER BY id").all();
}

function updatePlayer(id, { name, odds }) {
  const fields = [];
  const params = [];
  if (typeof name === "string" && name.trim().length > 0) {
    fields.push("name = ?");
    params.push(name.trim());
  }
  if (Number.isFinite(odds) && odds > 0) {
    fields.push("odds = ?");
    params.push(odds);
  }
  if (fields.length === 0) return false;
  params.push(id);
  const info = db
    .prepare(`UPDATE players SET ${fields.join(", ")} WHERE id = ?`)
    .run(...params);
  return info.changes > 0;
}

function addBet({ firstName, lastName, playerId, amount }) {
  const player = db
    .prepare("SELECT id, name, odds FROM players WHERE id = ?")
    .get(playerId);
  if (!player) return null;
  const payout = Number((amount * player.odds).toFixed(2));
  const createdAt = new Date().toISOString();
  const info = db
    .prepare(
      "INSERT INTO bets (bettor_first_name, bettor_last_name, player_id, amount, payout, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(firstName, lastName, playerId, amount, payout, createdAt);
  const bet = db
    .prepare(
      "SELECT b.id, b.bettor_first_name AS firstName, b.bettor_last_name AS lastName, p.name AS playerName, p.odds AS odds, b.amount, b.payout, b.created_at AS createdAt FROM bets b JOIN players p ON b.player_id = p.id WHERE b.id = ?"
    )
    .get(info.lastInsertRowid);
  return bet;
}

function getBets() {
  return db
    .prepare(
      "SELECT b.id, b.bettor_first_name AS firstName, b.bettor_last_name AS lastName, p.name AS playerName, p.odds AS odds, b.amount, b.payout, b.created_at AS createdAt FROM bets b JOIN players p ON b.player_id = p.id ORDER BY b.id DESC"
    )
    .all();
}

module.exports = {
  getPlayers,
  updatePlayer,
  addBet,
  getBets,
};
