import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { formatWhole } from "../src/lib/sizing";
import { normalizeTunisianPhone } from "../src/lib/inquiry";
import { asciiDigits, tidyEmail, tidyName, tidyPhone } from "../src/components/form-help";

// The motion and ease-of-use pass over the whole site (the user, 26 November 2026): each concept of the user's list has
// at least one place where it now shows, and none of the new motion plays for visitors who ask for less motion.
const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const css = source("../src/app/signature.css");
const pass = css.slice(css.indexOf("The motion and ease-of-use pass over every page"));
const reduced = pass.slice(pass.indexOf("@media (prefers-reduced-motion: reduce)"));
const field = (value: string) => ({ value }) as HTMLInputElement;

test("squash and stretch, follow through: the selection pills stretch on their way and settle; « Devis » squashes as it takes an article", () => {
  const motion = source("../src/components/motion.tsx");
  assert.ok(motion.includes("export function SegmentedThumb") && motion.includes("node.animate(stretchKeyframes(far)"), "the segmented thumbs stretch and settle");
  for (const file of ["galleries", "catalog", "guide", "sizing-calculator", "quote-builder"]) {
    const component = source(`../src/components/${file}.tsx`);
    assert.ok(component.includes("<SegmentedThumb index={"), `${file} uses the stretching thumb`);
    assert.ok(!component.includes('<span className="segmented-thumb" aria-hidden="true" />'), `${file} has no still thumb left`);
  }
  assert.ok(source("../src/components/range-nav.tsx").includes("thumb.animate(stretchKeyframes(far)"), "the buttons at the top of the pages too");
  assert.ok(pass.includes("@keyframes quote-hit { 0% { scale: 1; } 30% { scale: 1.16 0.86; } 55% { scale: 0.94 1.07; }"), "« Devis » squashes, stretches back and settles");
});

test("anticipation and arcs: the token sinks before it flies its arc; arrows pull back before they go", () => {
  const basket = source("../src/components/basket.tsx");
  assert.ok(basket.includes("scale(1.18, 0.82)") && basket.includes("scale(0.9, 1.1)"), "a squash before leaving, a stretch on the arc");
  assert.ok(pass.includes(":is(.carousel-arrow.next, .stage-arrow.next") && pass.includes("@keyframes wind-rise") && pass.includes(".back-to-top:active svg { translate: 0 3px;"), "arrows wind up, the way up dips when pressed");
  assert.ok(pass.includes("@keyframes compare-hint { 0% { --position: 50%; } 10% { --position: 54%; }"), "the comparison's sweep starts the other way");
  assert.ok(pass.includes("left 0.8s var(--ease), top 0.8s var(--glide)") && pass.includes("transform 0.6s var(--glide)"), "points and previews move on curves");
});

test("staging and pose to pose: one thing in front at a time, and new states come in from where they are", () => {
  assert.ok(pass.includes(".catalog-grid:has(.catalog-item:hover) .catalog-item:not(:hover) { opacity: 0.62; }"), "the article pointed at comes forward");
  const shell = source("../src/components/site-shell.tsx");
  assert.ok(shell.includes('{menuOpen && <div className="menu-scrim" aria-hidden="true" onClick={closeMenu} />}') && pass.includes(".menu-scrim { position: fixed; inset: 0; z-index: 49;"), "the phone menu dims the page; a tap there closes it");
  assert.ok(pass.includes(".nav-dropdown:not([hidden]) { animation: drop-in") && pass.includes(".mobile-nav:not([hidden]) > * { animation: line-in") && pass.includes(".mobile-menu-button svg { animation: icon-turn"), "menus open from their place, line after line");
  assert.ok(source("../src/components/catalog.tsx").includes('<span key={photo} className={`stage-slide${turn > 0 ? " from-next" : turn < 0 ? " from-back" : ""}`}>') && source("../src/components/galleries.tsx").includes('<span key={index} className={`stage-slide'), "photos come in from their side");
});

test("slow in and slow out, timing, solid drawing", () => {
  assert.ok(source("../src/app/layers.css").includes("--glide: cubic-bezier(0.65, 0, 0.35, 1);"));
  assert.ok(pass.includes(".segmented-thumb { transition: inset-inline-start 0.45s var(--glide); }") && pass.includes(".tab-bar { transition: transform 0.45s var(--glide), width 0.45s var(--glide); }"));
  assert.ok(pass.includes(".mosaic .project-tile img { transition: transform 0.6s var(--ease); }"), "a photo comes closer in 0.6 s, not 1.1 s");
  assert.ok(pass.includes(".segmented-track, .range-nav ul { box-shadow: inset 0 1px 2px") && pass.includes(".pill-button.primary:active { box-shadow: inset"), "tracks pressed in, pills standing on them, buttons pressed in");
});

test("secondary action and exaggerated feedback", () => {
  assert.ok(pass.includes(".inquiry-form > label:focus-within, .inquiry-form .form-row > label:focus-within { color: var(--brass-deep); }") && pass.includes("@keyframes ring-tilt"));
  assert.ok(source("../src/components/guide.tsx").includes("setMissing(true); shake(choices.current); return;"), "the guide's answers shake without an answer");
  const quote = source("../src/components/quote-builder.tsx");
  assert.ok(quote.includes("window.setTimeout(() => shake(catalogBox.current), 450);") && quote.includes('<form ref={shakeRef} className="inquiry-form quote-form"'), "the quote shakes what is missing");
  assert.ok(source("../src/components/inquiry-form.tsx").includes('<form ref={shakeRef} className="inquiry-form"'), "so does the contact form");
  assert.ok(source("../src/components/form-help.ts").includes('form.addEventListener("invalid", refused, true);'), "whatever the browser refuses, the first refused field shakes");
  assert.ok(pass.includes(":user-invalid { border-color: var(--brass-deep);") && pass.includes(".pill-button.primary.added { animation: added-flash"));
  assert.ok(source("../src/components/motion.tsx").includes("if (!element || reducedMotion()) return;"), "no shake for reduced motion");
});

test("Fitts's law and bigger hit areas", () => {
  assert.ok(pass.includes('.text-link::after { content: ""; position: absolute; inset: calc(50% - 22px) -8px; }'), "every small link reaches 44 px high");
  assert.ok(pass.includes(".story-steps button { width: 44px; height: 44px; }") && pass.includes(".guide-answer { min-height: 44px; }") && pass.includes(".model-chips a, .range-card .model-chips a { min-height: 44px; }"));
  assert.ok(pass.includes('.spot::after, .compare-handle::after { content: ""; position: absolute; inset: -10px; border-radius: 50%; }'));
  assert.ok(source("../src/components/quote-builder.tsx").includes('<label htmlFor={inputId} className="quote-thumb" aria-hidden="true">'), "a line's photo ticks it");
  assert.ok(source("../src/components/galleries.tsx").includes('className="lightbox-half prev"') && pass.includes(".lightbox-half { position: absolute; z-index: 1; top: 0; bottom: 0; width: 34%;"), "a whole side of the full-screen photo turns it");
});

test("Hick's law and Miller's law: the models grouped by range; long numbers and phone numbers in chunks", () => {
  assert.ok(source("../src/components/inquiry-form.tsx").includes("<optgroup key={family.id} label={`${family.name} · ${family.kind[locale]}`}>"));
  assert.equal(formatWhole(1248).replace(/[   ]/g, " "), "1 248");
  assert.equal(formatWhole(530), "530");
  for (const file of ["guide", "sizing-calculator"]) assert.ok(source(`../src/components/${file}.tsx`).includes("≈ {formatWhole(shownPower)} W"));
  const phone = field("+216 31.547.491");
  tidyPhone(phone);
  assert.equal(phone.value, "31 547 491");
});

test("Postel's law: the forms take what is typed and tidy it", () => {
  assert.equal(normalizeTunisianPhone("۳۱۵۴۷۴۹۱"), "+21631547491", "Persian digits too");
  const arabic = field("٣١ ٥٤٧ ٤٩١");
  tidyPhone(arabic);
  assert.equal(arabic.value, "31 547 491");
  const wrong = field("12 34");
  tidyPhone(wrong);
  assert.equal(wrong.value, "12 34", "a number that is not Tunisian is left as typed, for the visitor to see");
  const name = field("  Aymen   Ben  Ali ");
  tidyName(name);
  assert.equal(name.value, "Aymen Ben Ali");
  const email = field(" Contact@EDDFA.tn ");
  tidyEmail(email);
  assert.equal(email.value, "contact@eddfa.tn");
  assert.equal(asciiDigits("١٢"), "12");
  assert.equal(asciiDigits("۱۲ pcs"), "12");
  const quote = source("../src/components/quote-builder.tsx");
  assert.ok(quote.includes("const text = asciiDigits(event.target.value);") && quote.includes("onBlur={() => setTyping(null)}"), "a quantity is typed freely, counted on leaving the box");
});

test("Jakob's law: you are here, menus close the usual ways, steps lead to their part, the logo leads to the top", () => {
  const shell = source("../src/components/site-shell.tsx");
  assert.ok(shell.includes('aria-current={here ? "page" : within ? "true" : undefined}') && pass.includes(".desktop-nav .nav-item:not(.nav-quote) .nav-link-row > a[aria-current]::after { transform: scaleX(1); }"), "the page's link, or its section's, is underlined");
  assert.ok(shell.includes("closing.current = window.setTimeout(() => setProductsOpen(false), 180);"), "the products menu forgives a slip of the pointer");
  assert.ok(shell.includes('url.pathname === window.location.pathname && url.search === window.location.search && !url.hash') && shell.includes('window.scrollTo({ top: 0, behavior:'), "a link to the open page goes back to its top");
  assert.ok(source("../src/components/quote-builder.tsx").includes('className="progress-jump"'), "the quote's steps can be clicked");
  assert.ok(source("../src/components/galleries.tsx").includes("if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step("), "a swipe turns the full-screen photo");
});

test("Doherty threshold and frequency of use", () => {
  assert.ok(pass.includes(":is(.quick-photo, .thumbnails button) { background-image: linear-gradient("), "pictures on their way show the loading light");
  const motion = source("../src/components/motion.tsx");
  assert.ok(motion.includes("window.sessionStorage.getItem(key)") && motion.includes(".slice(0, 8)"), "the visit's own memory, a few models at most");
  assert.ok(source("../src/components/catalog.tsx").includes("useEffect(() => { markSeen(product.id); }, [product.id]);"));
  assert.ok(source("../src/components/quote-builder.tsx").includes("for (const productId of seenModels())"), "the quote opens the ranges of the models seen");
  assert.ok(source("../src/components/guide.tsx").includes('remember<string | null>("eddfa-heating", null)'), "the guide keeps the heating answer for the visit");
});

test("overall appeal: everything pressable answers the same way; none of the new motion plays for reduced motion", () => {
  assert.ok(pass.includes(".gallery-close, .progress-jump):active { scale: 0.95; transition: scale var(--press); }"));
  for (const part of [".quote-hit", ".nav-dropdown:not([hidden])", ".mobile-nav:not([hidden]) > *", ".mobile-menu-button svg", ".stage-slide", ".quick-copy > *", ".menu-scrim", ".pill-button.primary.added", ".segmented-thumb", ".range-pill", ".range-preview", ".detail-photo:hover img"]) assert.ok(reduced.includes(part), `${part} keeps still for reduced motion`);
  assert.ok(!pass.includes(".hero"), "the first section is left alone");
  // No component still writes the old still thumb.
  for (const file of readdirSync(new URL("../src/components/", import.meta.url))) {
    if (file.endsWith(".tsx")) assert.ok(!source(`../src/components/${file}`).includes('className="segmented-thumb" aria-hidden="true" />') || file === "motion.tsx", file);
  }
});
