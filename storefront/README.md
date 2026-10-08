# EDDFA Storefront Prototype

Next.js 16 / React / TypeScript storefront and custom EDDFA administration panel, based on the requested [Nabina Glass reference](https://nabinaglass.com/). Updated October 8, 2026. The standalone Vercel presentation uses bundled products without any database. The local administration panel still uses a separate local Medusa/PostgreSQL backend. This is not a transaction-ready shop. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Run

```powershell
npm install
npm run dev -- --port 3000
```

Open http://127.0.0.1:3000/fr or http://127.0.0.1:3000/ar. For this integrated prototype, first start the database and API as described in `../backend/README.md`. The existing `.env.local` enables `MEDUSA_BACKEND_URL=http://127.0.0.1:9000` and `EDDFA_LOCAL_ADMIN=true`. The panel's local-origin guard expects port 3000. Node 24 is used for this workspace; dependency versions are locked.

```powershell
npm run typecheck
npm test
npm run build
```

## Delivered Prototype

- Transparent, non-sticky desktop header, dark product dropdown, inline expandable mobile navigation and locale-preserving language links.
- Full-viewport desktop EDDFA product-photo hero, using the supplied EDEN lifestyle image without a maximum-height cap. The phone layout is compact, with the next section visible. No reference factory footage remains in the public site.
- Reference-style Montserrat/Karla typography, pale-gray/white bands, gold accents, outlined pill actions, uniform three-column product tiles with animated overlays, dark commitment section and four-column footer.
- Six EDDFA models and twelve dimension/power variants from the supplied workbook, with EDEN/ECLAT filters, specifications and installation notes. Published products now load from PostgreSQL through the backend. Client-entered prices display in TND; checkout remains disabled.
- French/Arabic homepage, company, searchable/filterable catalog, six product details, inspiration gallery and contact page. Arabic content renders in an RTL wrapper from the server; the document language/direction is synchronized on hydration.
- Embla swipe/drag carousels with three-second, visibility-aware autoplay and persistent manual pause. Passive cursor hover does not stop rotation; keyboard focus on content and open photo dialogs do. Play resumes without requiring the control to lose focus, and responsive reinitialization resynchronizes autoplay. Radix lightboxes/dialogs retain keyboard controls, focus management and Escape dismissal. Autoplay and entrance animations respect reduced motion.
- Image banners and breadcrumbs on the company, catalog, gallery and contact pages; expandable company panels and below-fold entrance animations.
- Validated Tunisian phone input and all 24 governorates. Product/variant selections carry into quote drafts, and changing the model resets its variant. Inquiries exist only in React memory: the success state explicitly says the request has not been sent. A visitor can download it or choose to compose an email. No email/order submission, database write, persistent customer storage or tracking event occurs automatically.
- `/admin` is our own branded dashboard, not a redirect to Medusa's native panel. `/admin/login` accepts the locally created owner account. The panel manages product CRUD, French/Arabic descriptions and installation text, images/reordering, versions/SKUs/prices, stock, percentage/fixed promo codes and component-based packs. Orders are read-only for now.
- The normal-text footer credit "Made by Aymen" links to `/admin` in this local preview. Obtain Abbess's approval before publishing; `NEXT_PUBLIC_EDDFA_SHOW_CREDIT` defaults to false in the example configuration. The link is convenience, not security. No Nabina customer logos, contact destinations, WordPress scripts or trackers are copied.

## EDDFA Assets and Launch Restrictions

Visible media now comes from the user's Images+Products folder: EDDFA's transparent logo, favicon, team photo, model/collection images and nine readable gallery photos. Originals are untouched. Optimized copies are in public/eddfa. The unused reference media is archived outside public/ in archive/reference-assets. Source details and asset limitations are in ASSET-PROVENANCE.md. All pages remain noindex/nofollow; this discourages indexing but is not access control. The prototype has not been deployed.

The reference layout, CSS palette and typography were re-inspected and refined after EDDFA content replacement. The model carousel replaces the reference client-logo band without implying customer affiliations. French copy follows the supplied business notes, with draft Arabic localization to approve before launch. The supplied Veritas PDF is labelled as a historical 2023 document for EDEN 100/50, with stated validity through June 25, 2026; it does not establish current certification of the whole range.

## Content and Architecture

- `src/lib/content.ts`: initial EDDFA catalog seed, gallery/company/page copy and footer approval flag. Public products are loaded by `src/lib/catalog-server.ts`; `CatalogProvider` shares the current catalog with client components.
- `src/lib/products.ts`: compact option labels and complete quote variant descriptions. Electrical resistance and claimed thermal output are distinct fields; test conditions need client confirmation.
- `src/components`: shared page sections, navigation, dialogs, carousels, catalog/detail and inquiry form.
- `src/app/[locale]/[[...segments]]/page.tsx`: dynamic public French/Arabic routes and per-page metadata, including new published products.
- `src/components/admin`, `src/app/admin`: custom client dashboard and login styled with EDDFA branding, existing fonts and gold/gray accents.
- `src/app/api/admin`, `src/lib/admin-*`: same-origin server gateway, strict schema validation, private session handling and native commerce workflows. Tokens are never stored in localStorage or returned to client JavaScript.
- `public/eddfa`: optimized media, untouched certificate PDF and original favicon. `npm run assets` imports from the adjacent Images+Products folder and regenerates mechanical renditions; it skips unreadable gallery JPEGs, but fails on missing/corrupt core product assets.

The eventual architecture remains Next.js storefront/custom admin on Vercel, Medusa API plus worker/Redis on Railway, PostgreSQL and image storage on Supabase, and Resend. Medusa's native admin UI is disabled. Keep commerce calculations, authorization, stock and COD evidence on the backend, never in browser state or direct Supabase queries. No database password, private storage key or admin token belongs in a public environment variable.

The custom panel uses real database writes and native authentication, an HttpOnly SameSite=Strict cookie and same-origin mutation checks. Both apps are restricted to local development. Use the supplied temporary login only locally; strong passwords, mandatory MFA, staff permissions, recovery and production session handling are still required. Product edits span multiple native workflows; this prototype does not promise atomic cross-workflow rollback or concurrent-editor protection.

Still to implement before commerce launch: approved SKUs/prices/stock/translations and renewed certification evidence, editable non-product page content, guest COD checkout, staff roles/mandatory MFA, WhatsApp order entry, confirmation/dispatch/capture guards, inspection-based returns, durable event outbox and consent-aware Pixel/CAPI, courier fees/evidence, transactional email, backups and recovery tests. Promo codes are stored but cannot be redeemed until checkout exists. Billing and proposal issue decisions remain unresolved; this prototype neither activates paid services nor sends the proposal.
