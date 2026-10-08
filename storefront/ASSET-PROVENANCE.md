# EDDFA Asset Provenance

Customized October 8, 2026 using the user-supplied ../Images+Products folder. No source files were altered. Visible pages use public/eddfa only; historical Nabina media is preserved outside the public directory in archive/reference-assets and is not served by Next.js.

## Active EDDFA Media

| Local stem in public/eddfa | Supplied source | Use |
| --- | --- | --- |
| logo | Branding/logo_transparent.png | Header, menu and footer; original grey/red colors and transparency retained. |
| logo-card | Branding/logo.png | Imported alternate, not displayed. |
| logo.ico | Branding/logo.ico | Favicon, copied unchanged. |
| en442 | Branding/logo_euronorm_EN442_certification.png | Historical technical-document section on About only. |
| certificat-veritas-en442.pdf | Branding/certificat_veritas_EN442.pdf | Exact, unchanged downloadable document. |
| eden-cover | Products/EDEN/EDEN Category Cover.jpg | Hero, company/catalog/contact banners and contact image. |
| eclat-cover | Products/ECLAT/ECLAT Category Cover.jpg | Dark commitment-section photo and gallery banner. |
| eden-80, eden-100, eden-120 | Products/EDEN/EDEN 80 (13 Tubes).jpg, EDEN 100 (17 Tubes).jpg, EDEN 120 (21 Tubes).jpg | Model images. |
| eclat-classic, eclat-confort, eclat-service | Products/ECLAT/ECLAT CLASSIC.jpg, ECLAT CONFORT.jpg, ECLAT SERVICE.jpg | Original model photos; display enlargement capped. |
| gallery-001, gallery-002 | Gallery/gallery_001.jpg, gallery_002.jpg | Higher-resolution equivalents of the supplied CLASSIC/CONFORT model photos, plus gallery. |
| gallery-003, gallery-004, gallery-005, gallery-006, gallery-008, gallery-009, gallery-0011 | Corresponding files in Gallery/ | Gallery; gallery-005 also used for the CTA background. |
| team | Misc/about-img.png | Real EDDFA team photo, displayed without cropping team members. |
| hero, contact | Misc/hero-bg.jpg, contact-bg.jpg | Imported alternates, not displayed; their built-in red panels would change the requested neutral/gold style. |

Image files are mechanically resized/compressed WebP renditions, not AI-generated or recolored. Background photographs preserve their source colors. Layout and interactions follow the inspected reference, with a neutral/gold CSS palette; product frames use contain-fit where needed to show full radiators.

## Data and Limitations

- Product names and all twelve dimension/power variants come from EDDFA_Products_Catalog.xlsx, Products sheet rows 2-13. Company/installation copy follows EDDFA_Website_Content_Notes.txt, with newly drafted Arabic localization to approve. Source fields remain distinguishable: EDEN entraxe/weight versus ECLAT resistance, and claimed thermal power for both.
- No prices, sellable stock, official SKUs, finish availability or additional product families were supplied. Local IDs are content keys, not invented manufacturer SKUs. No live purchasing is enabled.
- The three original ECLAT model JPGs are only 249 x 249 px. CLASSIC/CONFORT use the corresponding higher-resolution supplied gallery photos for their main view. SERVICE still needs a higher-resolution replacement; no AI upscaling is used.
- Gallery/gallery_0010.jpg fails strict JPEG decoding with "premature end of JPEG image". It is preserved in the source folder and excluded from the website. Nine other supplied gallery photos render successfully.
- The two-page Veritas PDF was visually inspected. It concerns EDEN 100/50, is dated June 2023 and explicitly limits validity to June 25, 2026. No renewed certificate was supplied. The site labels it as historical, and does not claim current whole-range EN 442 certification. No electrical safety ratings or unsupported guarantees were invented.
- Confirm image/content rights, Arabic wording, current certification, model availability and thermal test conditions with EDDFA before public launch. This local prototype remains noindex/nofollow, not deployed.

## Archived Reference Media

Source: https://nabinaglass.com/, observed and collected from its rendered public page for the user-requested local visual prototype. Rights remain with the respective owners. No redistribution or commercial-use licence is asserted. Replace with approved EDDFA assets or obtain permission before publishing. Watermarks and source branding have not been removed.

| Local stem in archive/reference-assets | Original URL |
| --- | --- |
| factory.mp4 | https://nabinaglass.com/wp-content/uploads/2025/05/IMG_6329.mp4 |
| factory-poster.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/NGAF-banner2-scaled.jpg |
| workshop.webp | https://nabinaglass.com/wp-content/uploads/2025/05/Company-Profile-Socialmedia-FF-06-scaled-1.webp |
| showroom.webp | https://nabinaglass.com/wp-content/uploads/2025/10/9-NH-1-ar.webp |
| mirrors.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/custom-cut-mirrors-768x768.jpg |
| shower.png | https://nabinaglass.com/wp-content/uploads/2025/05/shower-glass-enclosure.png |
| partitions.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/Glass-Wall-Doors-768x960.jpg |
| dome.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/Glass-Dome-768x768.jpg |
| tables.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/table-tops-768x960.jpg |
| facade.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/store-front-768x768.jpg |
| mirror-project.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/Proj50-Mirror-768x768.jpg |
| railing.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/Proj51-Balustrade-768x768.jpg |
| bathroom.jpg | https://nabinaglass.com/wp-content/uploads/2025/05/Bath-Shower-Glass-Panel-768x768.jpg |

`.optimized.webp` files are resized/compressed mechanical renditions, not evidence of ownership. No original site HTML, plugin code, stylesheet, customer logo strip, analytics pixel or third-party form backend is included.

Typeface packages: Montserrat Variable, Karla Variable, Bricolage Grotesque Variable and Noto Sans Arabic Variable from Fontsource; their package licences are included with installed dependencies. Interface icons use Lucide; overlays use Radix Dialog; draggable/automatic carousels use Embla and its official Autoplay plugin. Review dependency licences before production release.
