# Rebuilding the homepage container from scratch

This repo is the backup for the `homepage` LXC (Proxmox CT 101, on `minicomp-1` since 2026-10-30).
There is no Proxmox backup job for it on purpose: everything on the box is either in this repo,
regenerable, or the separate CAM demo (see the end). Written 2026-10-30 for a future Steve who has
forgotten all of this. Each block is copy-paste.

**What is NOT in this repo and where it comes from**

| Thing | Source |
|---|---|
| `.env` (admin user, JWT secret, SMTP app password, mail-to address) | Steve's password manager, or generate new ones (step 5) |
| Admin password | Seeded as `admin123` by `npm run setup`; change it (step 5) |
| Cloudflare tunnel connector token | Cloudflare dashboard → Zero Trust → Networks → Tunnels → the `homepage` tunnel → Configure → copy the install token |
| Tailscale/Headscale identity | Preauth key in `~/dev/proxapi/config.toml` `[mesh]` |
| Database content added through the admin panel | Not backed up. As of 2026-10-30 the live DB equals a fresh seed except 5 image rows deleted and the `contact_email` / `contact_phone` settings blanked. Redo those by hand in the admin panel after step 5. See `CLAUDE.md` before relying on the admin panel for content |
| Contact-form submissions (`contact_submissions` table) | Lost on rebuild. The form also emails each one to `EMAIL_TO`, so the inbox is the record |
| CAM touchscreen demo at camtouchdemo.lostandlucky.dev | Its own repo, step 8 |

## 1. Create the container (from the Mac, Proxmox API)

Follow the pattern in `~/dev/homelab/paperless-lxc/create-ct.sh` (API token from `~/dev/proxapi/config.toml`,
template `local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst`, `ssh-public-keys` = `~/.ssh/proxapi.pub`).
Values that matter for this guest:

```
vmid=101  hostname=homepage  node=minicomp-1  cores=2  memory=2048  swap=512
rootfs=local-zfs:20  unprivileged=1  features=nesting=1  onboot=1  startup=order=2,up=15
net0=name=eth0,bridge=vmbr0,ip=dhcp,hwaddr=BC:24:11:D7:79:64
```

The MAC is pinned on the UniFi gateway to `192.168.86.242`; keep it and the IP comes back by itself.
If 101 is taken, pick another VMID; nothing else depends on the number.

Start it, then: `ssh -i ~/.ssh/proxapi root@192.168.86.242`. Everything below runs on the container as root.

## 2. Packages

```bash
apt-get update && apt-get install -y curl git build-essential python3 nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs
curl -sSL -o /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && dpkg -i /tmp/cloudflared.deb
curl -fsSL https://tailscale.com/install.sh | sh
```

## 3. The app

```bash
git clone https://github.com/lostandlucky/lost-and-lucky-labs-homepage.git /opt/homepage
cd /opt/homepage
npm install
npm run setup      # creates data/lostandlucky.db, seeds projects, images, settings, admin user
npm run build      # builds client/dist and admin/dist
```

## 4. `.env`

```bash
cat > /opt/homepage/.env <<'ENV'
PORT=3000
NODE_ENV=production
ADMIN_USERNAME=admin
JWT_SECRET=<openssl rand -hex 32>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lostandluckylabs@gmail.com
SMTP_PASS=<Gmail app password: Google account → Security → App passwords; make a new one, one per sender>
SMTP_FROM=lostandluckylabs@gmail.com
EMAIL_TO=<where contact-form mail should land>
DB_PATH=./data/lostandlucky.db
ENV
chmod 600 /opt/homepage/.env
```

`ADMIN_PASSWORD_HASH` appears in the README but the login code checks the database, not `.env`; leave it out.

## 5. Admin password

`npm run setup` seeds user `admin` with password `admin123`. Change it before the tunnel goes up:

```bash
cd /opt/homepage && node -e '
const D=require("better-sqlite3"), b=require("bcrypt");
const pw=process.argv[1]; const db=new D("data/lostandlucky.db");
db.prepare("UPDATE admin_users SET password_hash=? WHERE username=?").run(b.hashSync(pw,10),"admin");
console.log("updated")' 'NEW-PASSWORD-HERE'
```

Then log in at `http://192.168.86.242:3000/admin` and redo the two hand edits: clear the contact email and phone in Settings, and delete any photos you don't want shown.

## 6. Service

```bash
cat > /etc/systemd/system/homepage.service <<'UNIT'
[Unit]
Description=Lost & Lucky Labs Homepage
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/homepage
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=5
EnvironmentFile=/opt/homepage/.env

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload && systemctl enable --now homepage
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/     # expect 200
```

## 7. Tunnel and mesh

The tunnel's ingress rules (lostandlucky.dev → `http://localhost:3000`, camtouchdemo → `http://localhost:8081`)
are remote-managed in Cloudflare and survive the container. Only the connector needs reinstalling:

```bash
cloudflared service install <token from the Cloudflare dashboard>
systemctl status cloudflared --no-pager | head -3
tailscale up --login-server https://headscale.lostandlucky.dev --authkey <preauth key> --hostname homepage
```

Check from outside: `https://lostandlucky.dev/` answers with the Cloudflare Access login, then the site.

## 8. CAM touchscreen demo (second tenant on this box)

Separate project; it only shares the container and the tunnel. From the Mac:

```bash
~/dev/CAM_Touchscreen_Experience/Tools/deploy-webgl-demo.sh        # rsyncs the WebGL build to /opt/cam-touch-demo/www/
```

Then copy `Tools/hosting/` from that repo (the nginx site for `127.0.0.1:8081` and `gate.html`) into
`/etc/nginx/sites-available/cam-touch-demo` (symlink into `sites-enabled`) and `/opt/cam-touch-demo/gate.html`,
set the shared password in the `map $cookie_camdemo` line, `nginx -t && systemctl reload nginx`.
Full notes: vault note `2026-08-09 CAM demo hosted on homepage LXC`.

## Redeploy after a code change (the normal case)

```bash
ssh -i ~/.ssh/proxapi root@192.168.86.242 'cd /opt/homepage && git pull && npm install && npm run build && systemctl restart homepage'
```

## Has this ever been tested?

No. The steps were assembled 2026-10-30 from the running container, the original ProxApi `deploy.sh`,
and the CAM deploy notes. The honest test is to build a throwaway CT from this file alone (skip step 7)
and diff its `data/lostandlucky.db` and `images/` against the live one. Do that before trusting it.
