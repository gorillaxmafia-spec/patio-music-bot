const db = new Map();
function profile(id, name) {
  if (!db.has(id)) db.set(id, { id, name, coins: 500, bank: 0, level: 1, xp: 0, wins: 0, losses: 0, inventory: [], lastDaily: 0 });
  return db.get(id);
}
function money(n) { return Math.floor(n).toLocaleString(); }
function xpFor(level) { return level * 100; }
module.exports = { db, profile, money, xpFor };
