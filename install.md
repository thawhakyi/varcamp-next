# VarCamp Next.js

This npm monorepo contains the VarCamp website and registration application.

## Applications

| Workspace | Development URL | Production command |
| --- | --- | --- |
| `web` | `http://localhost:3000` | `npm run start --workspace web` |
| `register` | `http://localhost:3001` | `npm run start --workspace register` |

The 2026 volunteer registration page is available at:

```text
http://localhost:3001/2026/volunteer
```

In production:

```text
https://register.var.camp/2026/volunteer
```

## Requirements

- Node.js 22.13 or newer (the register app uses the built-in `node:sqlite`)
- npm 11 or newer
- A Google Cloud service account with access to the registration spreadsheet
- PM2 for the production Node.js process
- Nginx or WordOps as a reverse proxy
- A proxied Cloudflare DNS record for production IP detection and rate limiting

## Local installation

Install dependencies from the repository root:

```bash
npm install
```

Create the register application environment file:

```bash
cp apps/register/.env.example apps/register/.env.local
```

On PowerShell:

```powershell
Copy-Item apps/register/.env.example apps/register/.env.local
```

Configure the following values in `apps/register/.env.local`:

```dotenv
GOOGLE_SERVICE_ACCOUNT_EMAIL=varcamp-sheets@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_RANGE="Volunteer Registrations!A:AA"
VOLUNTEER_RATE_LIMIT_MAX=5
VOLUNTEER_RATE_LIMIT_WINDOW_SECONDS=3600
```

Start only the register application:

```bash
npm run dev --workspace register
```

Useful checks:

```bash
npm run typecheck --workspace register
npm run build --workspace register
```

See [apps/register/GOOGLE_SHEETS_SETUP.md](apps/register/GOOGLE_SHEETS_SETUP.md)
for service-account, spreadsheet, privacy, and Cloudflare rate-limit setup.

## Production installation with WordOps

The following setup assumes the repository is installed directly inside:

```text
/var/www/register.var.camp/htdocs
```

Clone into a blank `htdocs` directory:

```bash
cd /var/www/register.var.camp/htdocs
git clone YOUR_REPOSITORY_URL .
```

Set ownership for the `ubuntu` deployment user:

```bash
sudo chown -R ubuntu:www-data /var/www/register.var.camp/htdocs
sudo chmod -R u=rwX,g=rX,o= /var/www/register.var.camp/htdocs
```

Install and build:

```bash
cd /var/www/register.var.camp/htdocs
npm ci

cp apps/register/.env.example apps/register/.env.production.local
nano apps/register/.env.production.local
chmod 600 apps/register/.env.production.local

npm run build --workspace register
```

The build output must include:

```text
/2026/volunteer
/2026/volunteer/success
```

### PM2

Install PM2 once:

```bash
sudo npm install --global pm2
```

Start the register application:

```bash
pm2 start npm \
  --name register-var-camp \
  --cwd /var/www/register.var.camp/htdocs \
  -- --workspace register run start

pm2 save
pm2 startup
```

Run the additional command printed by `pm2 startup`.

Verify Next.js directly:

```bash
pm2 status
curl -I http://127.0.0.1:3001/2026/volunteer
```

The request should return `200`.

## WordOps and Nginx

Edit the WordOps site:

```bash
sudo wo site edit register.var.camp
```

The HTTPS server must proxy Next.js pages and `/_next/` resources. The `^~`
modifier prevents WordOps static-file regex rules from intercepting JavaScript,
CSS, fonts, and other Next.js assets.

```nginx
location ^~ /_next/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;

    proxy_buffering off;
}

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
```

Do not put `try_files`, `fastcgi_pass`, or WordPress routing inside the proxied
`location /` block.

Configure the HTTP virtual host to redirect to HTTPS:

```nginx
return 301 https://$host$request_uri;
```

Validate and reload Nginx:

```bash
sudo nginx -t
sudo wo stack reload --nginx
```

Test the HTTPS origin without Cloudflare:

```bash
curl -kI \
  --resolve register.var.camp:443:127.0.0.1 \
  https://register.var.camp/2026/volunteer
```

## Cloudflare

- Proxy the `register.var.camp` DNS record.
- Use SSL/TLS mode **Full (strict)**.
- Prevent direct public access to the origin where possible.
- Create the registration rate-limit rule documented in
  [apps/register/GOOGLE_SHEETS_SETUP.md](apps/register/GOOGLE_SHEETS_SETUP.md).
- Purge the Cloudflare cache after fixing cached page or `/_next/` resource
  errors.

Production form submissions require Cloudflare's `CF-Connecting-IP` header.
The verified address is used for rate limiting and stored in the spreadsheet's
`Submitter IP` column.

## Attendee database

Attendee registrations and check-ins are stored in SQLite at
`ATTENDEE_DATABASE_PATH` (default `apps/register/data/attendees.sqlite`). The
file is created on the first registration and is not tracked by Git. The
`Attendee Registrations` sheet tab is rewritten from the database within about
15 seconds of each change, so edits made in the sheet are overwritten.

Back up the database daily, and before deploying on the event day:

```bash
cd /var/www/register.var.camp/htdocs/apps/register
mkdir -p backups
sqlite3 data/attendees.sqlite ".backup 'backups/attendees-$(date +%F-%H%M).sqlite'"
```

Use `.backup` rather than copying the file, so writes in progress are not
lost. Run the register app as a single PM2 process; the sheet copy is
scheduled in memory.

## Deploying updates

```bash
cd /var/www/register.var.camp/htdocs

git pull
npm ci
npm run build --workspace register
pm2 restart register-var-camp --update-env
```

Verify after each deployment:

```bash
pm2 status
curl -I http://127.0.0.1:3001/2026/volunteer
```

## Troubleshooting

### PM2 reports `EADDRINUSE`

Another process is using port `3001`:

```bash
pm2 stop register-var-camp
sudo ss -ltnp | grep ':3001'
```

Inspect and stop the obsolete process before restarting PM2.

### Next.js returns `200`, but Nginx returns `404`

Test the active HTTPS virtual host:

```bash
curl -kI \
  --resolve register.var.camp:443:127.0.0.1 \
  https://register.var.camp/2026/volunteer
```

Remove `try_files` from the proxied `location /` block and reload Nginx.

### The page loads, but JavaScript or CSS returns `404`

Add the `location ^~ /_next/` proxy block shown above. WordOps static-file
regex rules otherwise may try to read Next.js resources from the filesystem.

The same rules answer image, font, and other static-file paths outside
`/_next/`, so files in an app's `public/` folder return `404`. Import images
in code instead (for example `import image from "./image.png"`), which serves
them from `/_next/static/media/`.

### npm cannot find `package.json`

Run npm from the monorepo root:

```bash
cd /var/www/register.var.camp/htdocs
ls -l package.json package-lock.json
```

Do not run workspace commands from `/var/www/register.var.camp`.
