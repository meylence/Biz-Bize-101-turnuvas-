const playersTableBody = document.querySelector('#playersTable tbody');
const betsTableBody = document.querySelector('#betsTable tbody');
const playerSelect = document.querySelector('#playerSelect');
const amountInput = document.querySelector('#amount');
const payoutEl = document.querySelector('#payout');
const betForm = document.querySelector('#betForm');
const betStatus = document.querySelector('#betStatus');

let players = [];

async function fetchPlayers() {
  const res = await fetch('/api/players');
  players = await res.json();
  renderPlayers();
  renderPlayerOptions();
  updatePayout();
}

async function fetchBets() {
  const res = await fetch('/api/bets');
  const bets = await res.json();
  renderBets(bets);
}

function renderPlayers() {
  playersTableBody.innerHTML = '';
  for (const p of players) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>x${p.odds}</td>
    `;
    playersTableBody.appendChild(tr);
  }
}

function renderPlayerOptions() {
  playerSelect.innerHTML = '';
  for (const p of players) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (x${p.odds})`;
    playerSelect.appendChild(opt);
  }
}

function updatePayout() {
  const playerId = Number(playerSelect.value);
  const amount = Number(amountInput.value || 0);
  const player = players.find((p) => p.id === playerId);
  const payout = player ? (amount * player.odds) : 0;
  payoutEl.textContent = payout.toFixed(2);
}

playerSelect.addEventListener('change', updatePayout);
amountInput.addEventListener('input', updatePayout);

betForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  betStatus.textContent = '';
  betStatus.className = 'status';
  const payload = {
    firstName: document.querySelector('#firstName').value.trim(),
    lastName: document.querySelector('#lastName').value.trim(),
    playerId: Number(playerSelect.value),
    amount: Number(amountInput.value),
  };
  try {
    const res = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place bet');
    betStatus.textContent = 'Bet placed successfully!';
    betStatus.className = 'status success';
    betForm.reset();
    updatePayout();
    await fetchBets();
  } catch (err) {
    betStatus.textContent = err.message || 'Error placing bet';
    betStatus.className = 'status error';
  }
});

function renderBets(bets) {
  betsTableBody.innerHTML = '';
  for (const b of bets) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${b.firstName} ${b.lastName}</td>
      <td>${b.playerName}</td>
      <td>x${b.odds}</td>
      <td>${b.amount.toFixed ? b.amount.toFixed(2) : b.amount}</td>
      <td>${b.payout.toFixed ? b.payout.toFixed(2) : b.payout}</td>
      <td>${new Date(b.createdAt).toLocaleString()}</td>
    `;
    betsTableBody.appendChild(tr);
  }
}

// initial load
fetchPlayers();
fetchBets();