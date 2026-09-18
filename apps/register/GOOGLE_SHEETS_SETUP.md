# Google Sheets setup

The volunteer and organizer registration endpoints write directly to the Google
Sheets API with a service account. Credentials are only read by the register
app's server.

1. Create or select a Google Cloud project.
2. Enable the Google Sheets API for that project.
3. Create a service account and a JSON key.
4. Create a Google spreadsheet with one sheet tab named
   `Volunteer Registrations` and one named `Organizer Registrations`.
5. Share that spreadsheet with the service account email as an Editor.
6. Copy `.env.example` to `.env.local` inside `apps/register` and replace the
   example values with the service account email, private key, and spreadsheet
   ID.
7. Restart the register development server:

   ```bash
   npm run dev --workspace register
   ```

Both forms use the same `GOOGLE_SHEETS_SPREADSHEET_ID` and are separated by
sheet tab only:

| Form      | Range variable                 | Default tab                |
| --------- | ------------------------------ | -------------------------- |
| Volunteer | `GOOGLE_SHEETS_RANGE`          | `Volunteer Registrations`  |
| Organizer | `GOOGLE_SHEETS_ORGANIZER_RANGE`| `Organizer Registrations`  |

Both ranges are optional; the defaults above are used when they are unset. If
you use different sheet tabs, update those variables and keep each range at 27
columns (`A:AA`).

The first successful submission creates the 27-column header row if the tab is
empty. Later submissions are appended as new rows.

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
 and (http.request.uri.path eq "/api/volunteer-registrations"
      or http.request.uri.path eq "/api/organizer-registrations"))
```

Set the rule to five requests per IP per hour with a one-hour block duration.
The APIs also enforce the values in `VOLUNTEER_RATE_LIMIT_MAX` /
`VOLUNTEER_RATE_LIMIT_WINDOW_SECONDS` and `ORGANIZER_RATE_LIMIT_MAX` /
`ORGANIZER_RATE_LIMIT_WINDOW_SECONDS`. Each form keeps its own in-process
counter. This application fallback is stored in the running Node.js process;
Cloudflare remains the shared source of protection if the app runs in multiple
processes or restarts.
