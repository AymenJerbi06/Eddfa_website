# Standalone Client Presentation

Deployed October 8, 2026:
[French preview](https://eddfa-website.vercel.app/fr) |
[Arabic preview](https://eddfa-website.vercel.app/ar).
Project: `aymenjerbi06s-projects/eddfa-website`, Node 24, connected to GitHub's
`main` branch. Future pushes to that branch rebuild this review demo. No live
EDDFA domain, backend, database or paid plan was activated.

## GitHub and Vercel

- Repository: `AymenJerbi06/Eddfa_website`.
- Vercel root directory: `storefront`.
- Framework: Next.js; install: `npm ci`; build: `npm run build`.
- No database or backend credentials, paid plugins, storage buckets or email service
  are needed. Do not upload `.env.local` or add local admin credentials to Vercel.
- `VERCEL=1` automatically selects presentation mode, even if a backend URL is
  accidentally configured. This intentional guard must be revisited when real
  commerce is deployed; setting a backend URL alone does not activate it.
- Choose a hosting plan appropriate for commercial client work. Do not purchase
  or upgrade a plan without the account owner's approval.

## What the Client Can Explore

The French and Arabic storefront, company information, EDEN/ECLAT models and
specifications, gallery/lightboxes, animated navigation, carousels, factory map
and quote-draft form all work without a database. Images and fonts are bundled;
the embedded Google Map still needs a network connection to Google.

Products use the supplied initial catalog, not subsequent local database edits.
Prices and stock are unconfirmed. There is no checkout, order submission, payment
collection, automated email or tracking. A visitor can explicitly compose an email
or call using the existing contact links. Admin pages return 404; admin API requests
return 503 before authentication or backend access. Uploaded-backend image routes
return 404. Footer credit requires approval and is not an admin link in the demo.

`noindex, nofollow` is retained, but is not access control. The GitHub repository is
public. Keep originals, proposals, customer data, passwords and database backups
outside the published repository. Do not connect the live `eddfa.tn` domain for
this presentation. Use the new project's Vercel URL or a protected preview link.

## Local Preview Test

```powershell
cd storefront
npm ci
$env:EDDFA_DEMO_MODE = 'true'
npm test
npm run typecheck
npm run build
npm run start -- --port 3001
```

Open `http://127.0.0.1:3001/fr` and `/ar`. This environment override takes priority
over `.env.local`, so local database credentials do not need to be removed.
After stopping the presentation server, remove the session override with
`Remove-Item Env:EDDFA_DEMO_MODE` to use the local integrated panel again.

## Verified

- All 16 unit tests, TypeScript checking and local/Vercel production builds passed.
- Production-dependency audit reported zero known vulnerabilities.
- All 22 French/Arabic public routes returned 200 over the hosted URL, with
  `noindex, nofollow`. Both admin pages and the backend image proxy returned 404;
  admin session GET/POST/DELETE returned 503 without authentication or backend access.
- Laptop/home media, catalog filtering, animated header arrival and Arabic mobile
  product rendering were checked in the browser. No horizontal overflow or broken
  visible images was observed in these sampled views.
- The local admin login on port 3000 still renders; its database was not altered
  by these preview checks. This is a presentation smoke test, not a commerce audit.
