# Lost & Lucky Labs Homepage — Claude notes

React + Express + SQLite portfolio site with an admin panel. Runs as Proxmox LXC `homepage` (CT 101) on
`minicomp-1`, public at https://lostandlucky.dev through a Cloudflare Tunnel. `REBUILD.md` is the
from-scratch procedure; `README.md` covers local dev.

## The backup story (read before touching the admin panel)

**This GitHub repo is the backup. There is no Proxmox backup job for the container, by decision (2026-10-30).**

That works because site content lives in the repo: project text in `server/db/seed.sql` and
`scripts/seed-database.js`, photos in `images/projects/`. The admin panel, though, writes to
`data/lostandlucky.db` and uploads into `images/projects/` **on the server**, and `data/` is gitignored.
Anything added that way exists only on the container and is lost if the container is.

As of 2026-10-30 the live database matched a fresh seed except for five deleted image rows and two blanked
settings, so nothing is at risk today. Steve is not adding content for now.

**If you start using the admin panel for content, or improving the admin panel:** stop and settle the
backup path first. Options noted in the vault plan "Homepage — Make the GitHub Repo the Backup (Plan)":
an export script (database → `seed.sql` + image list, committed after each edit), or a Proxmox backup job
to another node. Until one exists, treat admin-panel content as unbacked-up and say so.

## Facts that bite

- Admin login checks `admin_users.password_hash` in the database, not `ADMIN_PASSWORD_HASH` in `.env`.
  `npm run setup` seeds `admin` / `admin123`; `REBUILD.md` step 5 changes it.
- `npm run setup` is insert-or-ignore: it does not update existing rows, so editing `seed.sql` on a live
  box does nothing until the row is removed or the DB recreated.
- `images/projects/<slug>/` on the server has leftover `08.jpg`+ files from the original scrape in three
  folders; the database does not reference them. Harmless, untracked.
- The same container also serves the CAM touchscreen demo via nginx on `127.0.0.1:8081` (separate repo).
  Don't remove nginx when working on this app.
- Deploy goes to the guest over `~/.ssh/proxapi`, never to the Proxmox node.
