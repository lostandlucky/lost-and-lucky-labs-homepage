# Lost & Lucky Labs Clone

A React + Node.js + SQLite monorepo — a woodworking portfolio site clone.

## Prerequisites

- Node.js 22+
- npm 10+

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all servers (client :5173, server :3000, admin :5174) |
| `npm test` | Run all tests |
| `npm run test:server` | Run server tests |
| `npm run test:client` | Run client tests |
| `npm run test:admin` | Run admin tests |

## Project Structure

```
├── server/    # Express API
├── client/    # Public-facing React app
├── admin/     # Admin React app
└── scripts/   # Utility scripts
```
