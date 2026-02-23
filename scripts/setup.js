import { existsSync, mkdirSync } from 'fs';
import { createDatabase, runSeed } from '../server/db/database.js';
import { seedDatabase } from './seed-database.js';

export function setupProject({ dataDir, dbPath, fs, skipDb } = {}) {
  const _fs = fs || { existsSync, mkdirSync };
  const _dataDir = dataDir || './data';
  const _dbPath = dbPath || `${_dataDir}/lostandlucky.db`;

  // Create data directory
  if (!_fs.existsSync(_dataDir)) {
    _fs.mkdirSync(_dataDir, { recursive: true });
  }

  if (skipDb) return;

  // Initialize database
  const db = createDatabase(_dbPath);
  seedDatabase(db);
  db.close();

  console.log('Setup complete. Database created at', _dbPath);
}

// Run if called directly
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule) {
  setupProject();
}
