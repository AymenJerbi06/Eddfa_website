import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { families, familyById, inspirations, installationGuides, installationKind, isScene, messages, navPaths, products } from "../src/lib/content";
import { formatDecimal, insulationCoefficients, recommend, requiredPower, sizingRanges } from "../src/lib/sizing";
import { clampQuantity, countLabel, initialSelection, quoteDraft, quoteGroups, selectedLines } from "../src/lib/quote";
import { TechDrawing } from "../src/components/tech-drawing";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("the home page hero is unchanged (client request, November 2026)", () => {
  const hero = "<section className=\"hero\"><Photo src={asset(\"eden-cover\")} alt=\"\" priority sizes=\"100vw\" className=\"hero-poster\" /><div className=\"hero-shade\" /><div className=\"container hero-content\"><h1><span className=\"hero-brand\">EDDFA</span>{t.heroTitle}</h1><p>{t.heroText}</p><Link href={`/${locale}/contact`} className=\"pill-button light\">{t.contact}</Link></div><a className=\"hero-next\" href=\"#about-eddfa\"><span>{t.what}</span><ArrowDown size={16} /></a></section>";
  assert.ok(source("../src/components/pages.tsx").includes(hero));
  assert.deepEqual([messages.fr.heroTitle, messages.fr.heroText, messages.fr.contact, messages.fr.what], ["Sèche-serviettes en aluminium.", "Fabriqués à Sfax. À eau chaude ou électriques, trouvez le confort qui s’accorde à votre salle de bain.", "Contactez-nous", "FABRICANT TUNISIEN"]);
  assert.deepEqual([messages.ar.heroTitle, messages.ar.heroText, messages.ar.contact, messages.ar.what], ["مجففات مناشف من الألمنيوم.", "صُنعت في صفاقس. بالماء الساخن أو بالكهرباء، اختر الراحة المناسبة لحمامك.", "اتصل بنا", "صناعة تونسية"]);
  for (const sheet of ["layers", "signature"]) assert.ok(!/\.hero\b/.test(source(`../src/app/${sheet}.css`)), `${sheet}.css must not restyle the hero`);
});

test("the added stylesheets keep the site's own typefaces and palette", () => {
  const css = source("../src/app/layers.css") + source("../src/app/signature.css");
  const fonts = [...css.matchAll(/font-family:\s*([^;}]+)/g)].map(match => match[1].trim());
  assert.ok(fonts.every(font => ["var(--display)", "var(--font)", "inherit"].includes(font)), fonts.join(" | "));
  const colours = new Set([...css.matchAll(/#[0-9a-f]{3,8}\b/gi)].map(match => match[0].toLowerCase()));
  const allowed = new Set(["#fff", "#ffffff", "#0f172a", "#687071", "#e6e8ea", "#141004", "#d2aa56", "#d4d6d6", "#e3bd70", "#92712d", "#9b7730", "#323838", "#2b2727", "#f3f4f3", "#f8f2e6", "#ccd0ce"]);
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

test("EDDFA's mark sits in two places only, and every range and model stays one tap away", () => {
  const css = source("../src/app/layers.css");
  const mark = css.match(/--ladder: url\("data:image\/svg\+xml,([^"]+)"\)/);
  assert.ok(mark, "the radiator-shaped E of the logo is defined once as a mask");
  assert.ok(!mark[1].includes("#") && !/fill='(?!black')/.test(mark[1]), "the mark takes its colour from the palette tokens, not from the drawing");
  const uses = [...css.matchAll(/([^{}]+)\{[^}]*var\(--ladder\)/g)].map(match => match[1].trim());
  assert.deepEqual(uses, [".commitment::before"], "only the « Nos exigences » band carries the mark (the calculator draws its own radiator)");
  const pages = source("../src/components/pages.tsx");
  assert.ok(pages.includes('aside={<RangeNav tone="light" label={t.rangesNav} links={families.map(item => ({ href: `/${locale}/produits/${item.id}`'), "every range page switches between the five ranges");
  const catalog = source("../src/components/catalog.tsx");
  assert.ok(catalog.includes('<RangeNav tone="light" label={`${t.modelsNav} ${family.name}`}'), "article pages switch between the models of their range");
  assert.ok(catalog.includes('<div className="detail-bar" data-show={barVisible} inert={!barVisible}>'), "phones get a quote bar that stays out of the tab order while hidden");
  assert.ok(catalog.includes('rootMargin: "0px 0px 100000px 0px"'), "the bar also appears after a jump past the quote button");
  assert.match(source("../src/components/sizing-calculator.tsx"), /<WarmRadiators key=\{`\$\{best\.variant\.id\}-\$\{best\.units\}`\} units=\{best\.units\}/, "the calculator's radiator warms up again whenever the advice changes");
  assert.ok(source("../src/components/site-shell.tsx").includes('${stuck ? " stuck" : ""}'), "a compact header follows past the first screen");
});

test("the home page tells one story, each thing said once", () => {
  const pages = source("../src/components/pages.tsx");
  const home = pages.slice(pages.indexOf("export function HomePage"), pages.indexOf("// One list grouped by range"));
  const order = ['<section className="hero">', "<FactsStrip", "<AboutSection", "<RangeShowcase", "<Exigences", 'className="section inspiration-section"', "<FaqSection", "<CallToAction"];
  const positions = order.map(marker => home.indexOf(marker));
  assert.ok(positions.every(position => position >= 0), order.filter((_, index) => positions[index] < 0).join(", "));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, "blocks in story order");
  assert.equal((home.match(/<Reveal>|<CallToAction|<section className="hero">/g) ?? []).length, 7);
  for (const gone of ["QuoteBand", "RangeFinder", "ModelList", "trust-section", "TwoTone", "CompanyValues", "FamilyGrid", "finder-callout"]) assert.ok(!pages.includes(gone), `${gone} is gone`);
  for (const key of ["aboutTitle", "productsTitle", "commitment", "inspirationTitle", "sizingTitle", "infoTitle", "startTitle", "faqTitle"] as const) {
    assert.ok(!messages.fr[key].includes("\n") && !messages.ar[key].includes("\n"), `${key} is one calm line`);
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
  assert.doesNotMatch(css, /\b\d+px \d+px 0 var\(--(?:dark|gold|gold-deep)\)/, "no hard offset shadows taken from the user's other sites");
  assert.ok(!css.includes("--ink-line") && !css.includes("rotate(-2deg)"), "no ink outlines and no tilted sticky notes");
  assert.match(css, /\.section-heading h2, [^{]*\{ font-family: var\(--font\); font-weight: 500;/, "headlines in EDDFA's own Montserrat, light and large");
  assert.match(css, /--rungs: url\("data:image\/svg\+xml,/, "the label mark is drawn from the rungs of EDDFA's logo");
  assert.match(css, /\.eyebrow::before \{ content: ""; flex-shrink: 0; width: 18px; height: 16px; background: var\(--gold\); -webkit-mask: var\(--rungs\)/);
  assert.match(css, /\.showcase-section, \.faq-section, [^{]*\{ background: var\(--brushed\); \}/, "brushed-aluminium surfaces between white and dark");
  const pages = source("../src/components/pages.tsx");
  assert.ok(pages.includes('<figure className="cta-photo"><div className="cta-photo-frame"><Photo src={asset("closer-eden")} alt={t.closerAlt}'), "the closer shows the EDEN 120 scene");
});

test("second start: sections that answer the visitor, with real figures only and motion that can be switched off", () => {
  const showcase = source("../src/components/showcase.tsx");
  assert.ok(showcase.includes("families.map((family, index) => <button"), "the range stage lists the five ranges in the client's order");
  assert.ok(showcase.includes("inert={!shown}"), "hidden ranges stay out of the tab order");
  assert.ok(showcase.includes("{family.sizing && <Link"), "the sizing tool is offered on EDEN and ECLAT only");
  assert.ok(showcase.includes('window.matchMedia("(prefers-reduced-motion: reduce)")'), "no rotation for visitors who ask for reduced motion");
  assert.ok(showcase.includes("const principleFacts = [0, 2, 3];"), "each requirement shows one of EDDFA's own facts");
  for (const locale of ["fr", "ar"] as const) {
    assert.equal(messages[locale].facts.length, 4);
    assert.deepEqual([0, 2, 3].map(index => messages[locale].facts[index].value.replace(/\s/g, " ").replace("صفاقس", "Sfax")), ["100 %", "EN 442", "Sfax"]);
  }
  const css = source("../src/app/signature.css");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\n  \.marquee-track \{[^}]*animation: none;/);
  assert.match(css, /@supports \(animation-timeline: view\(\)\)/, "scroll-tied drift only where the browser supports it");
  const catalog = source("../src/components/catalog.tsx");
  assert.ok(catalog.includes('product.category === "eclat" ? variant.resistance ?? 0 : variant.thermalPower'), "card figures: element power for ECLAT, announced output for EDEN");
  assert.ok(source("../src/components/galleries.tsx").includes('<div className="project-carousel filmstrip"'));
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
  assert.ok(pages.includes('<section className="hero"><Photo src={asset("eden-cover")}'), "the first section keeps its own photo");
  assert.ok(pages.includes('<Photo src={asset("team-straight")}'), "the team photo is EDDFA's real one, straightened");
});
