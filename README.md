# Lost & Lucky Labs Clone

A React + Node.js + SQLite monorepo — a woodworking portfolio site clone.

## Prerequisites

- Node.js 18+
- npm 10+

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd lostandlucky
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Initialize database
npm run setup        # Creates DB, runs schema, seeds data

# 4. Download images from Squarespace (one-time)
npm run scrape-images

# 5. Start development servers
npm run dev          # Starts client (:5173) + server (:3000) + admin (:5174)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all servers (client :5173, server :3000, admin :5174) |
| `npm run dev:client` | Start client dev server only |
| `npm run dev:server` | Start Express server only |
| `npm run dev:admin` | Start admin dev server only |
| `npm run build` | Build client and admin for production |
| `npm start` | Start production server |
| `npm run setup` | Initialize database (schema + seed) |
| `npm run scrape-images` | Download images from Squarespace |
| `npm run seed` | Re-seed database with project data |
| `npm test` | Run all tests |
| `npm run test:server` | Run server tests |
| `npm run test:client` | Run client tests |
| `npm run test:admin` | Run admin tests |
| `npm run test:scripts` | Run scripts tests |
| `npm run test:watch` | Run tests in watch mode |

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `development` or `production` |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD_HASH` | bcrypt hash, set during `npm run setup` |
| `JWT_SECRET` | Secret key for JWT tokens |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / app password |
| `EMAIL_TO` | Recipient for contact form submissions |
| `DB_PATH` | SQLite database file path |

## Production Build

```bash
# Build both frontends
npm run build

# Output:
#   client/dist/   → served by Express at /
#   admin/dist/    → served by Express at /admin

# Start production server
NODE_ENV=production npm start
```

## Project Structure

```
├── server/    # Express API + static file serving
├── client/    # Public-facing React app (Vite)
├── admin/     # Admin React app (Vite)
└── scripts/   # Setup, seeding, and image scraping utilities
```
