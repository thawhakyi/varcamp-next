# Moving register.var.camp to a new VPS

This plan moves the register app to a new server with a short downtime
(about 10 minutes), then sets up GitHub Actions to test and deploy it.

## What must move

| Item | Where it is now | Notes |
| --- | --- | --- |
| Attendee database | `apps/register/data/attendees.sqlite` | **Only copy of registrations and check-ins.** Must not be lost. |
| Production secrets | `apps/register/.env.production.local` | Google, R2 and check-in secrets. Not in Git. |
| Nginx site config | WordOps site config | Rewritten for the new server (see below). |
| PM2 process | `register-var-camp` | Recreated on the new server. |

These do **not** need to move: the Google Sheet and the R2 photo bucket
(both are external), and rate-limit counters (kept in memory).

The `Attendee Registrations` sheet tab is rewritten from the database. If
two servers run at the same time, they create duplicate ticket numbers and
overwrite each other's sheet copy. **Only one server may run the app at a
time.**

## Timing

The event and check-in are on **15 Nov 2026**.

- Finish the move by **10 Nov**, so there are a few days to find problems.
- Do the switch at a quiet time, such as late night Myanmar time.
- Do not deploy or change servers from **14 Nov to 16 Nov**.

## Step 1. Back up the current server (do now)

On the current server:

```bash
cd /var/www/register.var.camp/htdocs
git pull
sudo apt-get install -y sqlite3
bash scripts/backup-register.sh
```

The script saves `~/register-backups/register-backup-<date>.tar.gz` with:

- the database (safe copy with `.backup`, checked with `integrity_check`)
- the env files
- the Nginx config (if `sudo` works without a password; otherwise copy it
  by hand)
- the PM2 process list and software versions

It prints the number of attendees and the last ticket number. Note them.

Copy the backup to your computer:

```bash
scp 'ubuntu@OLD_SERVER_IP:~/register-backups/register-backup-*' ./
```

Keep it private. It holds attendee personal data and production secrets.

Add a daily database backup until the move is done:

```bash
crontab -e
```

```cron
15 3 * * * bash /var/www/register.var.camp/htdocs/scripts/backup-register.sh --db-only >> $HOME/register-backups/cron.log 2>&1
```

## Step 2. Prepare the new server

Recommended: Ubuntu 24.04 LTS, at least 2 GB RAM (the Next.js build needs
it; add swap on smaller servers).

### Software

```bash
sudo apt-get update
sudo apt-get install -y nginx sqlite3 git ufw
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install --global pm2
```

Node.js 22.13 or newer is required (`node:sqlite`). Node.js 24 LTS is
recommended.

### Deploy user and folders

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /srv/register.var.camp/{releases,shared/data,backups}
sudo chown -R deploy:deploy /srv/register.var.camp
```

Layout:

```text
/srv/register.var.camp/
  current -> releases/<commit>     # the running version
  releases/<commit>/               # one folder per deploy
  shared/.env.production.local     # secrets, kept between deploys
  shared/data/attendees.sqlite     # database, kept between deploys
  backups/
```

Each deploy builds in a new folder and then switches `current`. The running
app is not touched during the build, and a rollback is one symlink change.

In `shared/.env.production.local`, set an absolute database path:

```dotenv
ATTENDEE_DATABASE_PATH=/srv/register.var.camp/shared/data/attendees.sqlite
```

Then `chmod 600` the file.

### HTTPS and firewall

- In Cloudflare, create an **Origin Certificate** for `register.var.camp`
  (SSL/TLS > Origin Server). Save it on the server in `/etc/ssl/cloudflare/`.
  This works with **Full (strict)** and does not need DNS to point at the
  new server first.
- Allow ports 80 and 443 **only from Cloudflare IP ranges**
  (https://www.cloudflare.com/ips/). The app trusts the `CF-Connecting-IP`
  header for rate limiting, so direct access to the server must be blocked.
- Allow SSH (port 22).

### Nginx

Plain Nginx is enough. WordOps is not needed; its static-file rules caused
the `/_next/` 404 problems in `install.md`.

```nginx
server {
    listen 80;
    server_name register.var.camp;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name register.var.camp;

    ssl_certificate     /etc/ssl/cloudflare/register.var.camp.pem;
    ssl_certificate_key /etc/ssl/cloudflare/register.var.camp.key;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_buffering off;
    }
}
```

### First install and test

Install the current `master` into `releases/`, link `shared/` files,
build, and start PM2 as the `deploy` user (the deploy script in Step 4 will
do the same steps). Restore a **test copy** of the backup database, then
check the site without changing DNS:

```bash
curl -I --resolve register.var.camp:443:NEW_SERVER_IP https://register.var.camp/2026/attendee
```

Also open the site in a browser with a hosts-file entry, and test one
registration, the ticket page and check-in. Afterwards, delete the test
database so the real one can be copied at the switch.

## Step 3. Switch servers

Expected downtime: about 10 minutes.

1. **Old server:** stop the app so no new registrations arrive, and keep it
   stopped after a reboot:

   ```bash
   pm2 stop register-var-camp
   pm2 save
   ```

2. **Old server:** take the final backup and note the counts it prints:

   ```bash
   bash /var/www/register.var.camp/htdocs/scripts/backup-register.sh
   ```

3. Copy the backup to the new server, extract it, and put
   `attendees.sqlite` at `/srv/register.var.camp/shared/data/`. Check it:

   ```bash
   sqlite3 /srv/register.var.camp/shared/data/attendees.sqlite \
     "PRAGMA integrity_check; SELECT COUNT(*), MAX(ticket_number) FROM attendees;"
   ```

   The counts must match step 2.

4. **New server:** start or restart the app and check it with the
   `curl --resolve` command above.

5. **Cloudflare:** change the `register.var.camp` A record to the new IP.
   Keep it **proxied**. Because the record is proxied, the change works in
   seconds.

6. Test the live site: registration, ticket page, ticket download,
   check-in sign-in, and that the sheet tab updates within about 15 seconds.

7. Keep the old server **stopped but not deleted** until after the event.

### Rollback

If the new server fails and **no one has registered on it yet**: point the
A record back to the old IP and run `pm2 start register-var-camp` on the old
server.

If people have registered on the new server, first copy the new database
back to the old server (same `.backup` method), then switch.

## Step 4. GitHub automation

Do this after the move works. Two workflows:

### 4.1 Checks on every pull request (`.github/workflows/ci.yml`)

Runs on pull requests and pushes to `master`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build --workspace register`

No secrets are needed. A failing check shows on the PR before merge.

### 4.2 Deploy to production (`.github/workflows/deploy-register.yml`)

- **Trigger:** push to `master` that changes `apps/register/**`,
  `packages/**` or `package-lock.json`, and a manual "Run workflow" button.
- **Approval:** uses a GitHub **environment** named `production` with you as
  required reviewer. Nothing deploys until you approve it in GitHub.
- **One at a time:** a `concurrency` group stops two deploys from
  overlapping.
- **Code transfer:** the workflow sends the commit with `git archive` over
  SSH. The server needs no GitHub access.
- **On the server**, a script `scripts/deploy-register.sh` will:
  1. back up the database (`backup-register.sh --db-only`)
  2. unpack the commit into `releases/<commit>`
  3. link `shared/.env.production.local`
  4. run `npm ci` and `npm run build --workspace register`
  5. switch `current` to the new release and run `pm2 reload`
  6. check `http://127.0.0.1:3001/2026/attendee` returns `200`
  7. if the check fails, switch `current` back and reload again
  8. keep the last 5 releases and delete older ones

GitHub secrets (Settings > Environments > production):

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | New server IP or SSH host name |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | Private key made only for GitHub Actions |
| `DEPLOY_KNOWN_HOSTS` | Output of `ssh-keyscan NEW_SERVER_IP` |

App secrets (Google, R2, check-in) stay in `shared/.env.production.local` on
the server. They are not stored in GitHub.

Because the firewall allows ports 80 and 443 only from Cloudflare, SSH (port
22) must stay open for GitHub Actions. Use key login only and disable
password login.

### 4.3 Event-day rule

From 14 Nov to 16 Nov, do not approve deploys. The `production` approval
step makes this easy to enforce.

## Checklist

- [ ] Step 1: backup taken and copied to your computer
- [ ] Step 1: daily backup cron added
- [ ] Step 2: new server ready and tested with a test database
- [ ] Step 3: switch done, counts match, live site tested
- [ ] Step 3: old app stopped and saved in PM2
- [ ] Step 4: CI workflow added
- [ ] Step 4: deploy workflow, script and secrets added; first deploy approved
- [ ] Old server deleted after the event
