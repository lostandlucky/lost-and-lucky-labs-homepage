import 'dotenv/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { createDatabase } from './db/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DB_PATH = resolve(__dirname, '..', process.env.DB_PATH || './data/lostandlucky.db');
const production = process.env.NODE_ENV === 'production';

const db = createDatabase(DB_PATH);
const app = createApp(db, {
  jwtSecret: process.env.JWT_SECRET,
  production,
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
