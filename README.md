# Lost & Lucky Labs Homepage

A faithful recreation of the [Lost & Lucky Labs](https://www.lostandluckylabs.com) woodworking portfolio site, built from scratch with React, Node.js, and SQLite. Originally a Squarespace site — now a fully custom monorepo with an admin panel.

## Features

- Full-bleed hero with YouTube background video at 0.5x playback
- Masonry portfolio grid with hover-reveal labels
- Project detail pages with image galleries and lightbox
- Contact form with email delivery
- Admin panel for managing projects, images, settings, and contact submissions
- 191 tests across all workspaces

## Tech Stack

- **Client**: React 18 + Vite + Tailwind CSS + React Router v6
- **Admin**: Separate React SPA (same stack)
- **Server**: Express + better-sqlite3 + JWT auth + multer + nodemailer
- **Database**: SQLite
- **Testing**: Vitest + React Testing Library

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run setup

# Download images from original site (one-time)
npm run scrape-images

# Start dev servers
npm run dev
```

This starts the client at `:5173`, server at `:3000`, and admin at `:5174`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all servers |
| `npm run build` | Build client and admin for production |
| `npm start` | Start production server |
| `npm run setup` | Initialize database (schema + seed) |
| `npm run scrape-images` | Download project images |
| `npm test` | Run all 191 tests |

## Project Structure

```
├── server/    # Express API + static file serving
├── client/    # Public-facing React app (Vite)
├── admin/     # Admin React app (Vite)
├── scripts/   # Setup, seeding, and image scraping
├── data/      # SQLite database
├── images/    # Project images
└── specs/     # Design specs and visual fidelity notes
```

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `development` or `production` |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD_HASH` | bcrypt hash (set during setup) |
| `JWT_SECRET` | Secret for JWT tokens |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email delivery |
| `EMAIL_TO` | Contact form recipient |

## Production

```bash
npm run build
NODE_ENV=production npm start
# Client served at /, Admin at /admin
```
