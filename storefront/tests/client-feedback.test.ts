import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { company, families, familyById, inspirations, installationGuides, installationKind, isScene, messages, navPaths, products, whatsappHref } from "../src/lib/content";
import { formatDecimal, insulationCoefficients, recommend, requiredPower, sizingRanges } from "../src/lib/sizing";
import { clampQuantity, countLabel, initialSelection, quoteDraft, quoteGroups, selectedLines } from "../src/lib/quote";
import { addLine, basketSize, mergeSelections, parseBasket } from "../src/lib/basket";
import { TechDrawing } from "../src/components/tech-drawing";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

// The first section's words, button and layout stay as they are (client request, November 2026); its photo was redone
// in the same style on 25 November 2026, and on 26 November it got « Voir nos produits » under « Contactez-nous » and
// charcoal words on the bright marble, at the user's request.
test("the home page hero keeps its words and layout, with its new photo", () => {
  const hero = "<section className=\"hero\"><HeroPhoto wide={asset(\"hero-eden\")} tall={asset(\"hero-eden-phone\")} className=\"hero-poster\" /><div className=\"hero-shade\" /><div className=\"container hero-content\"><h1><span className=\"hero-brand\">EDDFA</span>{t.heroTitle}</h1><p>{t.heroText}</p><div className=\"hero-actions\"><Link href={`/${locale}/contact`} className=\"pill-button light\">{t.contact}</Link><Link href={`/${locale}/produits`} className=\"pill-button light hero-products\">{t.heroProducts}</Link></div></div><HeroNext label={t.what} target=\"about-eddfa\" /></section>";
  assert.ok(source("../src/components/pages.tsx").includes(hero));
  assert.deepEqual([messages.fr.heroTitle, messages.fr.heroText, messages.fr.contact, messages.fr.what], ["Sèche-serviettes en aluminium.", "Fabriqués à Sfax. À eau chaude ou électriques, trouvez le confort qui s’accorde à votre salle de bain.", "Contactez-nous", "FABRICANT TUNISIEN"]);
  assert.deepEqual([messages.ar.heroTitle, messages.ar.heroText, messages.ar.contact, messages.ar.what], ["مجففات مناشف من الألمنيوم.", "صُنعت في صفاقس. بالماء الساخن أو بالكهرباء، اختر الراحة المناسبة لحمامك.", "اتصل بنا", "صناعة تونسية"]);
  assert.deepEqual([messages.fr.heroProducts, messages.ar.heroProducts], ["Voir nos produits", "اكتشف منتجاتنا"]);
  for (const sheet of ["layers", "signature"]) assert.ok(!/\.hero\b/.test(source(`../src/app/${sheet}.css`)), `${sheet}.css must not restyle the hero`);
});

test("the added stylesheets keep the site's own typefaces and palette", () => {
  const css = source("../src/app/layers.css") + source("../src/app/signature.css");
  const fonts = [...css.matchAll(/font-family:\s*([^;}]+)/g)].map(match => match[1].trim());
  assert.ok(fonts.every(font => ["var(--display)", "var(--font)", "inherit"].includes(font)), fonts.join(" | "));
  const colours = new Set([...css.matchAll(/#[0-9a-f]{3,8}\b/gi)].map(match => match[0].toLowerCase()));
  // The colours of the home page's first section, where the logo sits best: charcoal in three depths, marble white in
  // three depths and white cards, ink and muted text, and the brass of the tap in three tones. No red but the logo's.
  const allowed = new Set(["#232526", "#2c2f30", "#383b3c", "#fbfbfa", "#f2f1ef", "#e8e7e4", "#dcdad6", "#1f2122", "#5d6062", "#c9a96e", "#d4b57c", "#765c2f"]);
  assert.deepEqual([...colours].filter(colour => !allowed.has(colour)), []);
  const layout = source("../src/app/layout.tsx");
  assert.ok(layout.indexOf("./layers.css") > layout.indexOf("./globals.css") && layout.indexOf("./signature.css") > layout.indexOf("./layers.css"));
});

test("the five ranges are listed in the client's order with both languages", () => {
  assert.deepEqual(families.map(family => family.name), ["EDEN", "ECLAT", "EOLE", "ECLIPSE", "ELAN"]);
  for (const family of families) {
    assert.ok(family.kind.fr && family.kind.ar && family.summary.fr && family.summary.ar && family.intro.length, family.id);
    assert.ok(!products.some(product => product.handle === family.id), `${family.id} must not collide with a product address`);
  }
  assert.deepEqual(families.filter(family => family.sizing).map(family => family.id), ["eden", "eclat"]);
  assert.ok(families.filter(family => family.image).every(family => ["eden", "eclat"].includes(family.id)), "only supplied EDDFA photos");
  assert.equal(familyById("eole")?.name, "EOLE");
  assert.equal(familyById("eden-80"), undefined);
});

test("navigation lists the quote page and stays aligned in both languages", () => {
  assert.equal(navPaths.at(-1), "/devis");
  assert.equal(messages.fr.nav.length, navPaths.length);
  assert.equal(messages.ar.nav.length, navPaths.length);
  assert.equal(messages.fr.principles.length, 3);
  assert.equal(messages.ar.principles.length, 3);
  assert.equal(messages.fr.history.length, 4);
  assert.equal(messages.ar.history.length, 4);
});

test("every towel radiator has an installation guide matching how it is installed", () => {
  assert.deepEqual(products.map(product => installationKind(product)), ["hydraulic", "hydraulic", "hydraulic", "electric-wall", "electric-wall", "electric-floor"]);
  for (const guide of Object.values(installationGuides)) {
    assert.equal(guide.steps.length, 4);
    assert.ok(guide.steps.every(step => step.title.fr && step.title.ar && step.text.fr && step.text.ar) && guide.advice.fr && guide.advice.ar);
  }
});

test("sizing sliders start on a typical bathroom and stay within sensible limits", () => {
  assert.deepEqual(sizingRanges.surface, { min: 1, max: 30, step: 0.5, initial: 5 });
  assert.deepEqual(sizingRanges.ceiling, { min: 2, max: 4, step: 0.05, initial: 2.6 });
  assert.equal(formatDecimal(2.6, "fr"), "2,6");
  assert.equal(formatDecimal(2.6, "ar"), "2.6");
  assert.equal(formatDecimal(2.65, "fr", 2), "2,65");
});

test("sizing formula and model choice follow the published coefficients", () => {
  assert.deepEqual(insulationCoefficients, { good: 40, average: 50, poor: 60 });
  assert.equal(requiredPower(5, 2.6, "average"), 650);
  assert.equal(requiredPower(4, 2.5, "good"), 400);
  const eden = products.filter(product => product.category === "eden");
  const eclat = products.filter(product => product.category === "eclat");
  const pick = (result: ReturnType<typeof recommend>) => result.best && `${result.best.units}x${result.best.variant.id}`;
  assert.equal(pick(recommend(eden, "thermal", 500)), "1xeden-100-525");
  assert.deepEqual(recommend(eden, "thermal", 500).alternatives.map(option => option.variant.id), ["eden-120-475", "eden-120-525"]);
  assert.equal(pick(recommend(eden, "thermal", 653)), "1xeden-120-525");
  assert.equal(pick(recommend(eden, "thermal", 700)), "2xeden-80-475");
  // Electric models heat with their element's power, not the announced radiator output.
  assert.equal(pick(recommend(eclat, "electric", 350)), "1xeclat-classic-400");
  assert.equal(pick(recommend(eclat, "electric", 650)), "2xeclat-classic-400");
  assert.equal(recommend(eclat, "electric", 5000).best, null);
  assert.equal(recommend(eden, "thermal", 0).best, null);
});

test("quote lines cover every version and every range, and preselect where the visitor came from", () => {
  const groups = quoteGroups(products, "fr");
  assert.deepEqual(groups.map(group => [group.key, group.lines.length]), [["eden", 6], ["eclat", 6], ["eole", 1], ["eclipse", 1], ["elan", 1]]);
  assert.equal(groups[0].lines[0].detail, "800 × 475 mm");
  assert.equal(groups[1].lines[0].detail, "800 mm · 250 W");
  assert.deepEqual(initialSelection(products, groups, { ref: "eden-100-525", qty: "3" }), { "v:eden-100-525": 3 });
  assert.deepEqual(initialSelection(products, groups, { ref: "eclat-service" }), { "v:eclat-service-250": 1 });
  assert.deepEqual(initialSelection(products, groups, { gamme: "elan" }), { "f:elan": 1 });
  assert.deepEqual(initialSelection(products, groups, { ref: "unknown", gamme: "eden", qty: "500" }), {});
  assert.equal(clampQuantity(0), 1);
  assert.equal(clampQuantity(250), 99);
  assert.equal(clampQuantity(Number.NaN), 1);
  const selection = { "v:eden-80-475": 2, "f:eole": 1 };
  assert.equal(selectedLines(groups, selection).length, 2);
  const draft = quoteDraft("fr", { name: "Test", phone: "+21631547491", email: "", region: "Sfax", customerType: "Particulier", details: "" }, groups, selection);
  assert.match(draft, /- 2 × EDEN 80 · 800 × 475 mm/);
  assert.match(draft, /- 1 × EOLE · Modèle à préciser avec notre équipe/);
  assert.doesNotMatch(draft, /Email/);
  assert.equal(countLabel(1, "fr"), "1 article");
  assert.equal(countLabel(3, "fr"), "3 articles");
  assert.equal(countLabel(2, "ar"), "منتجان");
});

test("the decluttered pages keep details folded and motion optional", () => {
  const css = source("../src/app/layers.css");
  assert.match(css, /--ease: cubic-bezier\(0\.22, 0\.68, 0\.2, 1\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  const pages = source("../src/components/pages.tsx");
  assert.ok(pages.includes('className="soft-details compare-details"'), "version comparison is folded");
  assert.equal(messages.fr.progress.length, 3);
  assert.equal(messages.ar.progress.length, 3);
});

test("EDDFA's mark is the radiator of its logo, and every range and model stays one tap away", () => {
  const mark = source("../src/components/radiator-mark.tsx");
  assert.ok(mark.includes('viewBox="0 0 164 175"') && !/fill="#|fill='#/.test(mark), "the radiator takes its colours from the place it sits in");
  const pages = source("../src/components/pages.tsx");
  assert.ok(pages.includes('<section className={`band page-banner${film === "aluminium" ? "" : " range-banner"}`}>') && pages.includes('<FilmLoop name={film} wide className="banner-film" />'), "inner pages open on the charcoal band with a film");
  const emblem = source("../src/components/emblem.tsx");
  assert.ok(emblem.includes('viewBox="0 0 164 175"') && emblem.includes("const bars = [16, 31, 80, 96, 137, 153];") && !/(fill|stop-color)="#/.test(emblem), "the symbol behind the sections is the same radiator, in its ground's tints");
  for (const [file, use] of [["showcase", '<Emblem side="start" />'], ["site-shell", '<Emblem side="end" edge="bottom" />'], ["guide", "<RadiatorMark key="], ["guide", '<Emblem side="start" />'], ["quote-builder", '<RadiatorMark className="success-radiator" warm={6} />']] as const) {
    assert.ok(source(`../src/components/${file}.tsx`).includes(use), `${file} carries the radiator`);
  }
  assert.ok((pages.match(/<Emblem /g) ?? []).length >= 8, "the symbol sits behind the sections of every page");
  assert.ok(pages.includes('<PageTrack label={t.rangesNav} links={families.map(item => ({ href: `/${locale}/produits/${item.id}`'), "every range page switches between the five ranges");
  const catalog = source("../src/components/catalog.tsx");
  assert.ok(catalog.includes('<RangeNav label={`${t.modelsNav} ${family.name}`}'), "article pages switch between the models of their range");
  assert.match(source("../src/components/sizing-calculator.tsx"), /<WarmRadiators key=\{`\$\{best\.variant\.id\}-\$\{best\.units\}`\} units=\{best\.units\}/, "the calculator's radiator warms up again whenever the advice changes");
  assert.ok(source("../src/components/site-shell.tsx").includes('${stuck ? " stuck" : ""}'), "a compact header follows past the first screen");
});

test("phones: nothing floats over the page (the user's rule, November 2026)", () => {
  assert.ok(!source("../src/components/catalog.tsx").includes("detail-bar"), "no quote bar over the article page");
  assert.ok(!source("../src/components/quote-builder.tsx").includes("quote-bar"), "no bar over the quote page");
  assert.match(source("../src/app/layers.css"), /@media \(max-width: 921px\) \{\n  \.site-header \{ position: sticky;[^}]*\}\n  \.header-inner \{ gap: 10px; \}\n  \.contact-rail \{ display: none; \}/);
});

test("the home page tells one story, each thing said once", () => {
  const pages = source("../src/components/pages.tsx");
  const home = pages.slice(pages.indexOf("export function HomePage"), pages.indexOf("// One list grouped by range"));
  const order = ['<section className="hero">', "<AboutSection", "<ScrollStory", "<HomeGuide", "<RangeDuo", "<BeforeAfter", "<DetailSpots", 'className="section plate inspiration-section"', "<ProBand", "<FaqSection", "<CallToAction"];
  const positions = order.map(marker => home.indexOf(marker));
  assert.ok(positions.every(position => position >= 0), order.filter((_, index) => positions[index] < 0).join(", "));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, "blocks in story order");
  assert.ok(!home.includes("<Reveal>") && !home.includes("<FactsStrip"), "sections are there from the start, and nothing glides past");
  for (const gone of ["QuoteBand", "RangeFinder", "ModelList", "trust-section", "TwoTone", "CompanyValues", "FamilyGrid", "finder-callout"]) assert.ok(!pages.includes(gone), `${gone} is gone`);
  for (const key of ["aboutTitle", "productsTitle", "commitment", "inspirationTitle", "sizingTitle", "infoTitle", "startTitle", "faqTitle"] as const) {
    assert.ok(!messages.fr[key].includes("\n") && !messages.ar[key].includes("\n"), `${key} is one calm line`);
  }
  for (const key of ["guideTitle", "rangesTitle", "proTitle", "cta"] as const) {
    assert.equal(messages.fr[key].split("\n").length, 2, `${key}: a statement, then its answer`);
    assert.equal(messages.ar[key].split("\n").length, 2, `${key} (ar): a statement, then its answer`);
  }
  for (const locale of ["fr", "ar"] as const) {
    const t = messages[locale];
    assert.equal(t.faq.length, 5, `${locale} questions`);
    assert.ok(t.faq.every(item => item.q && item.a));
    assert.deepEqual(t.faq.map(item => item.href ?? ""), ["", "/produits/eden#choisir", "/devis", "", ""]);
    assert.equal(t.chapters.length, 5);
    assert.equal(t.assurances.length, 3);
    assert.equal(t.quoteSteps.length, 3);
  }
  assert.ok(pages.includes('<ol className="cta-steps" aria-label={t.stepsLabel}>'), "the closer carries the three quote steps");
  assert.ok(pages.includes('const chapterIds = ["activite", "historique", "produits", "informations", "locaux"] as const;'), "the presentation page follows the client's five points");
  for (const id of ["activite", "historique", "produits", "informations", "locaux"]) {
    assert.ok(pages.includes(`id="${id}"`) || source("../src/components/history-timeline.tsx").includes(`id="${id}"`), `chapter ${id} exists`);
  }
});

test("the technical drawing shows the chosen version's real dimensions at one scale", () => {
  const product = products.find(item => item.id === "eden-120")!;
  const variant = product.variants.find(item => item.id === "eden-120-525")!;
  const markup = renderToStaticMarkup(createElement(TechDrawing, { locale: "fr", product, variant, kind: "hydraulic" }));
  for (const text of ["H 1200", "L 525", "E 500"]) assert.ok(markup.includes(`>${text}<`), text);
  assert.equal((markup.match(/class="part tube"/g) ?? []).length, product.tubes);
  const small = products.find(item => item.id === "eden-80")!;
  const smallMarkup = renderToStaticMarkup(createElement(TechDrawing, { locale: "fr", product: small, variant: small.variants[0], kind: "hydraulic" }));
  const railHeight = (markup: string) => Number(markup.match(/<rect class="part" x="[\d.]+" y="[\d.]+" width="6" height="([\d.]+)"/)![1]);
  assert.equal(Math.round(railHeight(markup) / railHeight(smallMarkup) * 100), 150, "1 200 mm is drawn 1.5 times taller than 800 mm");
  const floor = products.find(item => item.id === "eclat-service")!;
  const floorMarkup = renderToStaticMarkup(createElement(TechDrawing, { locale: "ar", product: floor, variant: floor.variants[0], kind: "electric-floor" }));
  assert.ok(floorMarkup.includes('class="foot"') && !floorMarkup.includes(">E "), "the floor model stands on feet and has no water connections");
});

test("EDDFA's own look (Aluminium & Confort), nothing borrowed", () => {
  const css = source("../src/app/layers.css") + source("../src/app/signature.css");
  assert.doesNotMatch(css, /\b\d+px \d+px 0 var\(--(?:dark|brass|brass-deep|graphite|ink)\)/, "no hard offset shadows taken from the user's other sites");
  assert.ok(!css.includes("--ink-line") && !css.includes("rotate(-2deg)") && !css.includes("backdrop-filter: blur(18px)"), "no ink outlines, no tilted notes, no frosted cards");
  assert.match(css, /\.title \.soft \{ display: block; color: var\(--muted\); font-weight: 300; \}/, "titles: a statement, then its answer in a lighter weight");
  assert.ok(!/Karla|Bricolage/.test(css), "one typeface, Montserrat");
  const layout = source("../src/app/layout.tsx");
  assert.ok(!layout.includes("bricolage") && layout.includes("@fontsource-variable/karla"), "Karla stays only for the first section's own button");
  for (const selector of [".plate", ".about-section", ".guide-section", ".inspiration-section", ".faq-section"]) {
    assert.match(css, new RegExp(`\\${selector} \\{[^}]*background: var\\(--marble\\)`), `${selector} sits on the marble ground`);
  }
  for (const dark of [".band", ".ranges-section", ".pro-section", ".commitment", ".call-to-action", ".site-footer"]) assert.match(css, new RegExp(`\\${dark} \\{[^}]*background: var\\(--graphite\\)`), `${dark} is charcoal`);
  assert.ok(css.includes(".site-shell main { display: flow-root; background: var(--graphite); }") && css.includes("main > :not(.band) + .plate { margin-top: var(--inset); }"), "the page is charcoal, even above a first plate, and two plates never touch");
  assert.ok(!/#e[0-9a-f]1c2[0-9a-f]|#f01d27|:\s*red\b/i.test(css), "no red outside the logo");
  const pages = source("../src/components/pages.tsx");
  assert.ok(pages.includes('<figure className="cta-film"><ScrubFilm name="closer" alt={t.closerAlt} /></figure>'), "the closer shows the first section's bathroom, filmed");
});

test("the sections take turns, plate then band, so each one clearly starts and ends (the user's request, 25 November 2026)", () => {
  const files: Record<string, string> = { AboutSection: "pages", ScrollStory: "scroll-story", HomeGuide: "guide", RangeDuo: "showcase", BeforeAfter: "compare", DetailSpots: "details", ProBand: "pages", FaqSection: "pages", CallToAction: "pages" };
  const kind = (marker: string) => {
    if (marker.startsWith("className=")) return marker.includes(" plate ") ? "plate" : "band";
    const text = source(`../src/components/${files[marker]}.tsx`);
    const start = text.indexOf(`function ${marker}`);
    const section = text.slice(start, text.indexOf("<section", start) + 140);
    return /className="[^"]*\bplate\b/.test(section) ? "plate" : /className="[^"]*\bband\b/.test(section) ? "band" : "?";
  };
  const home = ["AboutSection", "ScrollStory", "HomeGuide", "RangeDuo", "BeforeAfter", "DetailSpots", 'className="section plate inspiration-section"', "ProBand", "FaqSection", "CallToAction"];
  assert.deepEqual(home.map(kind), ["plate", "band", "plate", "band", "plate", "band", "plate", "band", "plate", "band"]);
});

test("Higgsfield films: made from EDDFA's scenes, recorded, light to load, still for reduced motion", () => {
  const film = source("../src/components/film.tsx");
  assert.ok(film.includes("IntersectionObserver") && film.includes("prefers-reduced-motion") && film.includes('preload="none"') && film.includes("muted loop playsInline"), "loops play only on screen, never for reduced motion");
  assert.ok(film.includes('export const sequences: Record<SequenceName, number> = { story: 143, closer: 95 };'), "twice the frames since 26 November 2026, one made between each pair");
  assert.ok(film.includes("export function createGlide(") && film.includes("export function warmFrames("), "the scroll films glide to the scroll and decode the frames ahead");
  const provenance = source("../ASSET-PROVENANCE.md");
  for (const name of ["film/story", "film/closer", "film/eden", "film/eclat", "film/aluminium", "film/aluminium-light"]) assert.ok(provenance.includes(name), `${name} is recorded in ASSET-PROVENANCE.md`);
  const root = new URL("../public/eddfa/film/", import.meta.url);
  for (const name of ["eden", "eclat", "aluminium", "aluminium-light"]) for (const file of [`${name}.webp`, `${name}-720.mp4`, `${name}-1080.mp4`]) assert.ok(existsSync(new URL(file, root)), file);
  for (const [name, count] of [["story", 143], ["closer", 95]] as const) for (const size of ["d", "m"]) for (const index of [1, count]) assert.ok(existsSync(new URL(`${name}/${size}/${String(index).padStart(3, "0")}.webp`, root)), `${name}/${size}/${index}`);
});

test("the quote basket: added while exploring, kept in the browser, opened on the quote page (25 November 2026)", () => {
  assert.deepEqual(parseBasket('{"v:eden-80-475":2,"f:eole":1}'), { "v:eden-80-475": 2, "f:eole": 1 });
  assert.deepEqual(parseBasket('{"x:bad":1,"v:eden-80-475":-3,"v:ok-1":"2","p:eden-80":500}'), { "p:eden-80": 99 }, "junk is dropped and quantities stay within limits");
  assert.deepEqual(parseBasket("not json"), {});
  assert.deepEqual(addLine({ "v:eden-80-475": 1 }, "v:eden-80-475", 2), { "v:eden-80-475": 3 });
  assert.deepEqual(mergeSelections({ "v:a": 1, "v:b": 2 }, { "v:b": 5 }), { "v:a": 1, "v:b": 5 }, "a link's quantity wins");
  assert.equal(basketSize({ "v:a": 1, "v:b": 2 }), 2);
  for (const [file, use] of [["catalog", "<AddToQuote key={variant.id} locale={locale} lineId={`v:${variant.id}`} />"], ["guide", "<AddToQuote key="], ["sizing-calculator", "<AddToQuote key="], ["quick-view", "<AddToQuote locale={locale} lineId={`v:${variant.id}`} />"], ["site-shell", "<BasketCount label={t.basketLabel} />"], ["quote-builder", "writeBasket(selection)"]] as const) {
    assert.ok(source(`../src/components/${file}.tsx`).includes(use), `${file}: ${use}`);
  }
  for (const locale of ["fr", "ar"] as const) assert.ok(messages[locale].addedToQuote && messages[locale].viewQuote && messages[locale].basketLabel);
});

test("exploring: a quick view on every model chip, the same wall before and after, the EDEN up close", () => {
  assert.ok(source("../src/components/showcase.tsx").includes("<ModelChips locale={locale}"), "the range cards open their models in a quick view");
  const compare = source("../src/components/compare.tsx");
  assert.ok(compare.includes('asset("scene-eden-80-before")') && compare.includes('asset("scene-eden-80-after")') && compare.includes('type="range"'), "the comparison can also be moved from the keyboard");
  const details = source("../src/components/details.tsx");
  assert.ok(details.includes("eden.highlights[4][locale]") && details.includes("t.principles[0].text"), "the four points speak in EDDFA's own words");
  for (const locale of ["fr", "ar"] as const) for (const key of ["sameWallTitle", "detailsTitle"] as const) assert.equal(messages[locale][key].split("\n").length, 2, `${locale} ${key}`);
  const globals = source("../src/app/globals.css");
  assert.ok(globals.includes(".hero-next::after") && globals.includes("@keyframes cue-light") && globals.includes("opacity: clamp(0, (1 - var(--cue)) * 1.8, 1)"), "the first section's cue invites the scroll and fades as the visitor scrolls");
});

// The user, 25 November 2026 (evening): no more sections, none removed; the pieces already there answer the visitor more.
test("the existing pieces answer the visitor: range previews, the flight to « Devis », the close-up, the film's steps, the sheet's rows", () => {
  const quick = source("../src/components/quick-view.tsx");
  assert.ok(quick.includes("export function RangeCardShell") && quick.includes("export function RangePreview") && quick.includes('if (event.pointerType === "mouse") preview?.(product);'), "pointing at a model's chip shows it in the card");
  const showcase = source("../src/components/showcase.tsx");
  assert.ok(showcase.includes("<RangeCardShell key={family.id}") && showcase.includes("<RangePreview locale={locale} />") && showcase.includes("<ModelChips locale={locale}"), "both range cards carry the preview and the chips");
  const basket = source("../src/components/basket.tsx");
  assert.ok(basket.includes("flyToQuote(event.currentTarget)") && basket.includes('matchMedia("(prefers-reduced-motion: reduce)")'), "the article travels to « Devis », except for reduced motion");
  const details = source("../src/components/details.tsx");
  assert.ok(details.includes('"--zoom": scale') && details.includes("place(spot.x, focus.x)") && details.includes("setNear(true)"), "the photo moves in on the chosen point only once the visitor picks one");
  const story = source("../src/components/scroll-story.tsx");
  assert.ok(story.includes('className="story-steps"') && story.includes("onClick={() => go(index)}"), "the film's three requirements can be reached directly");
  assert.ok(source("../src/components/catalog.tsx").includes("selected={variant.id} onSelect={setVariantId}"), "a row of the sheet chooses the version");
  assert.ok(source("../src/components/galleries.tsx").includes('event.key !== "ArrowLeft" && event.key !== "ArrowRight"'), "the photo strip follows the arrow keys");
  const pages = source("../src/components/pages.tsx");
  const home = pages.slice(pages.indexOf("export function HomePage"), pages.indexOf("// One list grouped by range"));
  const parts = [...home.matchAll(/^    <(\w+)[ >]/gm)].map(match => match[1]);
  assert.deepEqual(parts, ["section", "AboutSection", "ScrollStory", "HomeGuide", "RangeDuo", "BeforeAfter", "DetailSpots", "section", "ProBand", "FaqSection", "CallToAction"], "no section added or removed");
});

test("nothing turns, glides or counts by itself; each requirement shows one of EDDFA's own facts", () => {
  const showcase = source("../src/components/showcase.tsx");
  assert.ok(!/setTimeout|setInterval|useAutoCycle/.test(showcase), "the ranges and the requirements stay still");
  assert.ok(showcase.includes("const principleFacts = [0, 2, 3];"), "each requirement shows one of EDDFA's own facts");
  assert.ok(showcase.includes("main.map(family =>") && showcase.includes("families.filter(family => family.sizing)"), "EDEN and ECLAT side by side, from the client's list");
  const galleries = source("../src/components/galleries.tsx");
  assert.ok(!galleries.includes("Autoplay") && galleries.includes('<div className="project-carousel filmstrip"'), "the photo strip moves only when the visitor moves it");
  const css = source("../src/app/layers.css") + source("../src/app/signature.css");
  assert.ok(!/@keyframes marquee|animation-timeline/.test(css), "no gliding strip and no photos drifting with the scroll");
  for (const locale of ["fr", "ar"] as const) {
    assert.equal(messages[locale].facts.length, 4);
    assert.deepEqual([0, 2, 3].map(index => messages[locale].facts[index].value.replace(/\s/g, " ").replace("صفاقس", "Sfax")), ["100 %", "EN 442", "Sfax"]);
  }
  const catalog = source("../src/components/catalog.tsx");
  assert.ok(catalog.includes('product.category === "eclat" ? variant.resistance ?? 0 : variant.thermalPower'), "card figures: element power for ECLAT, announced output for EDEN");
});

test("the home guide: central heating decides the range, the room decides the size, with the calculator's formula", () => {
  const guide = source("../src/components/guide.tsx");
  assert.ok(guide.includes("requiredPower(surface, ceiling, insulation)") && guide.includes("recommend(catalog.filter(product => product.category === family.id), family.sizing, power)"), "the same formula and choice as « Choisir son sèche-serviettes »");
  assert.ok(guide.includes('window.sessionStorage.setItem("eddfa-room"') && source("../src/components/sizing-calculator.tsx").includes('window.sessionStorage.getItem("eddfa-room")'), "the room carries over to the calculator");
  assert.ok(guide.includes("<AddToQuote key={`${best.variant.id}-${best.units}`} locale={locale} lineId={`v:${best.variant.id}`} quantity={best.units} />"), "the advice goes into the quote, with its quantity");
  const eden = products.filter(product => product.category === "eden");
  assert.equal(recommend(eden, "thermal", 650).best?.variant.id, "eden-120-525", "a 5 m² bathroom, average insulation, 2.6 m: EDEN 120");
  for (const locale of ["fr", "ar"] as const) assert.ok(messages[locale].guideAssumption.includes("{h}"));
});

// The user, 25 November 2026 (late): the guide walks the visitor through one question at a time, like the booking on
// Rayda's site, and the close-up's points show their words in view on phones.
test("the guide asks one question at a time; on phones the close-up's card and the sheet read without scrolling sideways", () => {
  const guide = source("../src/components/guide.tsx");
  assert.ok(guide.includes("const RESULT = 3;") && guide.includes("{step === 0 && <fieldset") && guide.includes("{step === 1 && <fieldset") && guide.includes("{step === 2 && <fieldset") && guide.includes("{step === RESULT && <div className=\"guide-result\">"), "one question per step, then the answer");
  assert.ok(guide.includes("<form key={step}") && guide.includes("onClick={() => go(step - 1)}") && guide.includes("onClick={() => go(n)}"), "the next question takes the place of the last; « Retour » and the answers so far go back");
  assert.ok(guide.includes("if (step === 0 && !range) { setMissing(true); shake(choices.current); return; }"), "« Continuer » asks for an answer first (and the answers shake, since 26 November 2026)");
  for (const locale of ["fr", "ar"] as const) {
    const t = messages[locale];
    assert.equal(t.guideSteps.length, 3);
    assert.ok(t.guideProgress.includes("{n}") && t.guideContinue && t.guideBack && t.guideShow && t.guideRestart && t.guideChange && t.guidePick && t.guideResult);
  }
  const details = source("../src/components/details.tsx");
  assert.ok(details.includes('className="details-card"') && details.includes("onClick={() => step(1)}") && details.includes('scrollIntoView({ block: "nearest"'), "on phones a tapped point shows its words right under the photo");
  assert.ok(source("../src/components/spec-table.tsx").includes("data-label={column.label}"), "on phones each version of the sheet is a card with its values named");
  const css = source("../src/app/signature.css");
  assert.ok(css.includes(".guide-step.from-next") && css.includes(".details-card { grid-area: card;"), "the steps slide in; the card has its place on phones");
});

// The user, 25 November 2026 (night): the logo animated between pages and on every load, like the leaf on Rayda's site.
test("the logo is drawn, builds itself on the curtain between pages and on every load, and warms up in the header", () => {
  const logo = source("../src/components/logo.tsx");
  assert.ok(logo.includes('viewBox="-16 -16 2162 561"') && !/fill="#|fill='#/.test(logo), "the drawing keeps the picture's place and takes its colours from CSS");
  assert.equal((logo.match(/^  "M/gm) ?? []).length, 4, "four letters: D, D, F, A");
  assert.ok(logo.includes("const bars: [number, number][] = [[466, 33], [417, 33], [290, 33], [240, 34], [90, 33], [41, 33]];"), "six bars in three pairs, measured on the logo");
  const shell = source("../src/components/site-shell.tsx");
  assert.ok(shell.includes("<EddfaLogo className=\"brand-logo\"") && !shell.includes("logo.optimized.webp"), "the header and footer show the drawn logo");
  assert.ok(shell.includes("<div className={`page-curtain is-${curtain}`}") && shell.includes('<EddfaLogo className="curtain-logo" />'), "the curtain carries the logo");
  assert.ok(shell.includes('if (link.hasAttribute("aria-haspopup") || link.hasAttribute("data-no-curtain")) return;'), "a model chip opens its quick view without the curtain");
  assert.ok(shell.includes('useState<CurtainPhase>("intro")') && shell.includes('show("leaving")') && shell.includes('show("arriving")'), "on load, when leaving and when arriving");
  const css = source("../src/app/signature.css");
  assert.ok(css.includes(".page-curtain.is-intro { animation: curtain-lift") && css.includes(".page-curtain.is-leaving { pointer-events: auto; animation: curtain-cover") && css.includes(".page-curtain { display: none !important; }"), "the curtain lifts by itself and stays away for reduced motion");
});

test("contact and quote: EDDFA's number is never the example, WhatsApp appears only once EDDFA confirms its number", () => {
  for (const file of ["inquiry-form", "quote-builder"]) assert.ok(!source(`../src/components/${file}.tsx`).includes('placeholder="31 547 491"'), `${file}: neutral example`);
  assert.equal(company.whatsapp, null);
  assert.equal(whatsappHref("x"), null);
  company.whatsapp = "21600000000";
  assert.equal(whatsappHref("2 × EDEN 80"), "https://wa.me/21600000000?text=2%20%C3%97%20EDEN%2080");
  company.whatsapp = null;
  assert.ok(source("../src/components/quote-builder.tsx").includes('query.profil === "pro" ? "professional" : "individual"'), "installers arrive with the professional box chosen");
  const pages = source("../src/components/pages.tsx");
  const contact = pages.slice(pages.indexOf("export function ContactPage"), pages.indexOf("export function QuotePage"));
  assert.ok(!contact.includes("<CallToAction"), "the contact page ends with its form");
  const shell = source("../src/components/site-shell.tsx");
  assert.ok(shell.includes("<bdi>{family.name}</bdi><span> · {family.kind[locale]}</span>"), "the footer keeps the space before the dot on phones");
  assert.ok(shell.includes('<ClipboardList size={20} /><span className="rail-label">{t.nav[5]}</span>'), "the quote button shows a quote, not a chat bubble");
});

// The user's decision of 14 November 2026 (night): the product, range and gallery photos are the new bathroom scenes
// only, with no label on the page. Each one stays recorded in ASSET-PROVENANCE.md with how it was made and checked.
test("photos: products, ranges and galleries show the new scenes only, each recorded, none labelled on the page", () => {
  for (const product of products) assert.ok(product.gallery[0] === product.image && product.gallery.every(isScene), `${product.id} shows the new scenes only`);
  for (const item of inspirations) assert.ok(isScene(item.image), `${item.id} is one of the new scenes`);
  for (const family of families) assert.ok(!family.image || isScene(family.image), `${family.id} uses a new scene on its banner and on the home page`);
  const used = new Set([...products.flatMap(product => product.gallery), ...inspirations.map(item => item.image), ...families.flatMap(family => family.image ? [family.image] : []), "/eddfa/closer-eden.webp"]);
  assert.ok(used.size >= 11);
  const provenance = source("../ASSET-PROVENANCE.md");
  for (const image of used) {
    const name = image.replace(/^\/eddfa\//, "").replace(/\.webp$/, "");
    assert.ok(provenance.includes(`| ${name} |`), `${name} is recorded in ASSET-PROVENANCE.md`);
    assert.ok(existsSync(new URL(`../public/eddfa/${name}.optimized.webp`, import.meta.url)), `${name} is in public/eddfa`);
  }
  for (const file of ["catalog", "galleries", "showcase", "pages", "sizing-calculator"]) assert.ok(!source(`../src/components/${file}.tsx`).includes("scene-chip"), `${file}: no label on the photos`);
  const pages = source("../src/components/pages.tsx");
  assert.ok(pages.includes('<section className="hero"><HeroPhoto wide={asset("hero-eden")} tall={asset("hero-eden-phone")}'), "the first section shows its new photo, and phones its tall version");
  for (const name of ["hero-eden", "hero-eden-alt1", "hero-eden-alt2", "scene-eden-80-before", "scene-eden-80-after"]) {
    assert.ok(provenance.includes(`| ${name} |`), `${name} is recorded in ASSET-PROVENANCE.md`);
    assert.ok(existsSync(new URL(`../public/eddfa/${name}.optimized.webp`, import.meta.url)), `${name} is in public/eddfa`);
  }
  assert.ok(pages.includes('<Photo src={asset("team-straight")}'), "the team photo is EDDFA's real one, straightened");
});

// The user, 25 November 2026 (night), from their phone: every page's first section like the Photos page's, every link
// opening its page at the top, and the first section's arrow answering the visitor.
test("every inner page opens like the Photos page: the title and the breadcrumbs over the film, nothing else", () => {
  const pages = source("../src/components/pages.tsx");
  assert.ok(!pages.includes("aside={") && !pages.includes("aside?:"), "no band carries a chip track any more");
  assert.ok(pages.includes('<div className="container crumb-row"><nav className="breadcrumbs"'), "the band ends on the breadcrumbs");
  assert.equal((pages.match(/<PageTrack /g) ?? []).length, 3, "the products, range and « Présentation » pages start their plate with their chip track");
  assert.ok(pages.includes('<div className="page-heading"><p>{t.catalogText}</p><PageTrack'), "the products page offers its ranges under its first words");
  assert.ok(source("../src/app/layers.css").includes(".page-track {"));
});

test("every link of the site opens its page at the top, and a link to a part of a page lands on that part", () => {
  const shell = source("../src/components/site-shell.tsx");
  assert.ok(!shell.includes("scroll={") && !shell.includes("usePageArrival"), "no header link keeps the previous page's scroll");
  assert.ok(shell.includes("toTop.current = !url.hash;") && shell.includes('window.scrollTo({ top: 0, left: 0, behavior: "instant" });'), "the next page opens at its top, under the curtain");
  assert.ok(shell.includes('window.addEventListener("popstate", back);'), "Back and Forward keep their place");
});

test("the first section's arrow answers the visitor: pointing, pressing, clicking and scrolling", () => {
  const cue = source("../src/components/hero-next.tsx");
  assert.ok(cue.includes('node.style.setProperty("--cue", progress.toFixed(3));') && cue.includes('node.toggleAttribute("data-gone", progress >= 0.98);'), "the scroll pours the light down the rail and the cue fades");
  assert.ok(cue.includes('href={`#${target}`}') && cue.includes('<span className="cue-ring" aria-hidden="true"><ArrowDown size={16} /></span>'), "a click glides to the next section; the arrow sits in a ring");
  const globals = source("../src/app/globals.css");
  for (const rule of [".hero-next:hover .cue-ring", ".hero-next:active .cue-ring", ".hero-next:focus-visible .cue-ring", "calc(var(--cue) * 100%)", ".hero-next[data-gone]"]) assert.ok(globals.includes(rule), rule);
  for (const sheet of ["layers", "signature"]) assert.ok(!source(`../src/app/${sheet}.css`).includes("cue-ring"), `${sheet}.css leaves the first section alone`);
});

// The user, 25-26 November 2026 (night): the arrow keeps bouncing until the visitor scrolls; charcoal words on the bright
// marble; « Voir nos produits » under « Contactez-nous »; the light aluminium film on a few marble sections.
test("the first section reads in charcoal on the bright marble, and its arrow bounces until the visitor scrolls", () => {
  const globals = source("../src/app/globals.css");
  assert.ok(globals.includes("padding-block: 120px 60px; color: var(--graphite); }") && globals.includes(".hero-content p { color: rgb(35 37 38 / 84%);"), "the words are in the countertop's charcoal");
  assert.ok(globals.includes(".hero-shade { position: absolute; inset: 0; background: radial-gradient(") && globals.includes('[dir="rtl"] .hero-shade { scale: -1 1; }'), "a veil of marble behind the words, mirrored in Arabic");
  assert.ok(globals.includes(".hero-actions { display: inline-grid; gap: 12px; }") && globals.includes(".hero .pill-button.hero-products {"), "the two buttons, one under the other, the same width");
  assert.ok(globals.includes(".hero-next:not([data-scrolled]) .cue-ring { animation: cue-bounce 1.8s infinite; }") && globals.includes("@keyframes cue-bounce"), "the arrow bounces until the visitor scrolls");
  assert.ok(source("../src/components/hero-next.tsx").includes('node.toggleAttribute("data-scrolled", progress > 0.005);'));
  assert.ok(source("../src/app/layers.css").includes(".site-header:not(.solid):not(.stuck) { background: rgb(35 37 38 / 86%);"), "the header stays dark over the bright photo");
});

test("a few marble sections carry the light aluminium film", () => {
  const uses = source("../src/components/pages.tsx").split('<FilmLoop name="aluminium-light" wide className="plate-film" />').length - 1 + source("../src/components/guide.tsx").split('<FilmLoop name="aluminium-light" wide className="plate-film" />').length - 1;
  assert.equal(uses, 4, "the guide, the questions, Contact and the products chapter of « Présentation »");
  assert.ok(source("../src/components/film.tsx").includes('export type LoopName = "eden" | "eclat" | "aluminium" | "aluminium-light";'));
  assert.ok(source("../src/app/signature.css").includes(".plate-film { position: absolute; inset: 0; z-index: -2;"));
});

test("phones get a tall photo of the same bathroom, with the words above it", () => {
  const media = source("../src/components/media.tsx");
  assert.ok(media.includes('<source media="(max-width: 640px)" srcSet={phone.srcSet} sizes="100vw" width={1080} height={1910} />'), "phones load the tall photo, computers the wide one");
  assert.ok(existsSync(new URL("../public/eddfa/hero-eden-phone.optimized.webp", import.meta.url)));
  assert.ok(source("../ASSET-PROVENANCE.md").includes("| hero-eden-phone |"), "the tall photo is recorded");
  const globals = source("../src/app/globals.css");
  assert.ok(globals.includes(".hero { align-items: flex-start; overflow: clip; background: rgb(181 162 146); }") && globals.includes("aspect-ratio: 1080 / 1910;"), "on phones the words sit at the top and the bathroom shows under them");
});

test("the buttons at the top of the pages look like the Photos page's « Tout / EDEN / ECLAT »", () => {
  const nav = source("../src/components/range-nav.tsx");
  assert.ok(nav.includes('className={index === chosen ? "chosen" : undefined}') && nav.includes('style={{ "--count": links.length } as React.CSSProperties}'), "one track, the chosen button in charcoal");
  assert.ok(nav.includes("top <= line") && nav.includes("hold.current = { index, until: performance.now() + 2500 }; setSpot(index);"), "for parts of a page, the chosen button follows the part on screen, and stays on a tapped one while the page glides");
  assert.ok(nav.includes('<span ref={pill} className="range-pill" aria-hidden="true" />') && nav.includes("thumb.style.translate = `${(inner.left - outer.left) / scale}px ${(inner.top - outer.top) / scale}px`;"), "the charcoal pill glides to the chosen button, as on the Photos page");
  const layers = source("../src/app/layers.css");
  assert.ok(layers.includes(".range-nav[data-pill] a.chosen { background: transparent; }") && layers.includes(".range-pill, .soft-details::details-content"), "the pill takes over from the button's own charcoal, and keeps still for reduced motion");
  assert.ok(layers.includes(".range-nav ul { display: grid; grid-template-columns: repeat(var(--count), minmax(0, 1fr)); margin: 0; padding: 4px; list-style: none; border: 1px solid var(--line-soft); border-radius: 999px; background: var(--marble-2); }"), "the same track as the Photos page");
  assert.ok(layers.includes(".range-nav a.chosen { background: var(--graphite); color: var(--brass); }") && layers.includes(".range-nav ul:has(> li:nth-child(4)) { grid-template-columns: repeat(6, minmax(0, 1fr)); border-radius: 28px; }"), "charcoal and brass; two lines on phones beyond three buttons");
  assert.ok(!layers.includes("data-overflow"), "nothing runs off the screen any more");
});
