import test from "node:test";
import assert from "node:assert/strict";
import { company, navigationHref, navPaths } from "../src/lib/content";
import { pageArrivalDuration, pageArrivalProgress, pageArrivalTop } from "../src/components/page-arrival";

test("header navigation uses normal page URLs instead of instant hash jumps", () => {
  for (const locale of ["fr", "ar"] as const) {
    assert.equal(navigationHref(locale, navPaths[0]), `/${locale}`);
    for (const path of navPaths.slice(1)) {
      assert.equal(navigationHref(locale, path), `/${locale}${path}`);
    }
  }
});

test("page arrival retains a responsive banner preview and never scrolls above zero", () => {
  assert.equal(pageArrivalTop(540, 768), 448);
  assert.equal(pageArrivalTop(394, 844), 293);
  assert.equal(pageArrivalTop(514, 1112), 410);
  assert.equal(pageArrivalTop(540, 300), 484);
  assert.equal(pageArrivalTop(40, 900), 0);
});

test("page arrival easing is gradual, bounded and settles at the destination", () => {
  assert.equal(pageArrivalDuration, 720);
  assert.equal(pageArrivalProgress(-1), 0);
  assert.equal(pageArrivalProgress(0.25), 0.0625);
  assert.equal(pageArrivalProgress(0.5), 0.5);
  assert.equal(pageArrivalProgress(0.75), 0.9375);
  assert.equal(pageArrivalProgress(2), 1);
  const frames = Array.from({ length: 61 }, (_, i) => pageArrivalProgress(i / 60));
  assert.ok(frames.every((value, i) => i === 0 || value >= frames[i - 1]));
});

test("factory map retains the published EDDFA Google Maps place", () => {
  const url = new URL(company.mapEmbedUrl);
  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.pathname, "/maps/embed");
  const place = url.searchParams.get("pb")!;
  assert.ok(place.includes("!1s0x13002d34b7318d03:0x809d528a43131c33!2sEDDFA"));
  assert.ok(place.includes("!2d10.7389973!3d34.7262484"));
});
