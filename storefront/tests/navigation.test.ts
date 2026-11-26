import test from "node:test";
import assert from "node:assert/strict";
import { company, navigationHref, navPaths } from "../src/lib/content";

test("header navigation uses normal page URLs instead of instant hash jumps", () => {
  for (const locale of ["fr", "ar"] as const) {
    assert.equal(navigationHref(locale, navPaths[0]), `/${locale}`);
    for (const path of navPaths.slice(1)) {
      assert.equal(navigationHref(locale, path), `/${locale}${path}`);
    }
  }
});

test("factory map retains the published EDDFA Google Maps place", () => {
  const url = new URL(company.mapEmbedUrl);
  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.pathname, "/maps/embed");
  const place = url.searchParams.get("pb")!;
  assert.ok(place.includes("!1s0x13002d34b7318d03:0x809d528a43131c33!2sEDDFA"));
  assert.ok(place.includes("!2d10.7389973!3d34.7262484"));
});
