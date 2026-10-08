# EDDFA Client Preview

Live review demo: [French](https://eddfa-website.vercel.app/fr) |
[Arabic](https://eddfa-website.vercel.app/ar).

French/Arabic Next.js storefront for EDDFA, using the supplied EDDFA branding,
product specifications and optimized photographs. This repository contains only
the presentation storefront in `storefront/`. The local database, backend,
original client documents and credentials are intentionally not published.

## Vercel

Import this repository and set **Root Directory** to `storefront`, with the
**Next.js** framework preset. Use `npm ci` to install and `npm run build` to build.
No database, Medusa or storage credentials are required for the client preview.

Vercel deployments default to presentation mode. Products come from the bundled
catalog; administration, authentication and backend image requests are blocked.
Checkout and payment collection are not implemented. Contact forms prepare
unsent drafts; they do not send orders or email automatically.

See [deployment instructions](storefront/DEPLOYMENT.md) for testing and limitations.
