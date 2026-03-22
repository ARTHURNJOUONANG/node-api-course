const fs = require('fs/promises');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'db.json');

async function readDB() {
  const content = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(content);
}

async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
