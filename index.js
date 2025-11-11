const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API: Players
app.get("/api/players", (req, res) => {
  try {
    const players = db.getPlayers();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

app.put("/api/players/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, odds } = req.body;
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid player id" });
    }
    const hasName = typeof name === "string" && name.trim().length > 0;
    const hasOdds = Number.isFinite(odds) && odds > 0;
    if (!hasName && !hasOdds) {
      return res.status(400).json({ error: "Provide name and/or valid odds" });
    }
    const updated = db.updatePlayer(id, {
      name: hasName ? name.trim() : undefined,
      odds: hasOdds ? odds : undefined,
    });
    if (!updated) return res.status(404).json({ error: "Player not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update odds" });
  }
});

// API: Bets
app.get("/api/bets", (req, res) => {
  try {
    const bets = db.getBets();
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bets" });
  }
});

app.post("/api/bets", (req, res) => {
  try {
    const { firstName, lastName, playerId, amount } = req.body;
    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      !Number.isFinite(playerId) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({ error: "Invalid bet payload" });
    }

    const bet = db.addBet({ firstName, lastName, playerId, amount });
    if (!bet) return res.status(404).json({ error: "Player not found" });
    res.status(201).json({ success: true, bet });
  } catch (err) {
    res.status(500).json({ error: "Failed to place bet" });
  }
});

// Fallback to index.html via terminal middleware (no path pattern)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
