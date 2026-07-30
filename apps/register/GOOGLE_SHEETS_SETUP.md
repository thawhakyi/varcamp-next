# Google Sheets setup

The volunteer registration endpoint writes directly to the Google Sheets API
with a service account. Credentials are only read by the register app's server.

1. Create or select a Google Cloud project.
2. Enable the Google Sheets API for that project.
3. Create a service account and a JSON key.
4. Create a Google spreadsheet with a sheet tab named
   `Volunteer Registrations`.
5. Share that spreadsheet with the service account email as an Editor.
6. Copy `.env.example` to `.env.local` inside `apps/register` and replace the
   example values with the service account email, private key, and spreadsheet
   ID.
7. Restart the register development server:

   ```bash
   npm run dev --workspace register
   ```

The first successful submission creates the 27-column header row if the sheet
is empty. Later submissions are appended as new rows. If you use a different
sheet tab, update `GOOGLE_SHEETS_RANGE`; keep the range at 27 columns (`A:AA`).

The six Commitment and Agreement values are validated before submission but
are not stored in new spreadsheet rows. Their existing columns remain blank to
keep historical rows aligned. The verified Cloudflare client IP is stored in
the final `Submitter IP` column. Include this collection in the site's privacy
notice and retention policy.

Never commit `.env.local` or the downloaded service-account JSON key.

## Cloudflare proxy and submission rate limiting

Production submissions require Cloudflare's `CF-Connecting-IP` request header.
Prevent direct access to the origin before relying on this header. Cloudflare
Tunnel is preferred; Authenticated Origin Pulls or a firewall that only permits
Cloudflare IP ranges are also supported.

Create a Cloudflare WAF rate limiting rule with this expression:

```text
(http.request.method eq "POST"
 and http.request.uri.path eq "/api/volunteer-registrations")
```

Set the rule to five requests per IP per hour with a one-hour block duration.
The API also enforces the values in `VOLUNTEER_RATE_LIMIT_MAX` and
`VOLUNTEER_RATE_LIMIT_WINDOW_SECONDS`. This application fallback is stored in
the running Node.js process; Cloudflare remains the shared source of protection
if the app runs in multiple processes or restarts.
