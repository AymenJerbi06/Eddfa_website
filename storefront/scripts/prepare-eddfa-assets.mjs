import sharp from "sharp";
import { copyFile, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

const sourceRoot = join(process.cwd(), "..", "Images+Products");
const targetRoot = join(process.cwd(), "public", "eddfa");
const reviewRoot = join(process.cwd(), "output", "asset-review");
const images = [
  ["logo", "Branding/logo_transparent.png", 700],
  ["logo-card", "Branding/logo.png", 700],
  ["en442", "Branding/logo_euronorm_EN442_certification.png", 500],
  ["hero", "Misc/hero-bg.jpg", 2200],
  ["team", "Misc/about-img.png", 1600],
  ["contact", "Misc/contact-bg.jpg", 1800],
  ["eden-cover", "Products/EDEN/EDEN Category Cover.jpg", 2200],
  ["eden-80", "Products/EDEN/EDEN 80 (13 Tubes).jpg", 1400],
  ["eden-100", "Products/EDEN/EDEN 100 (17 Tubes).jpg", 1400],
  ["eden-120", "Products/EDEN/EDEN 120 (21 Tubes).jpg", 1400],
  ["eclat-cover", "Products/ECLAT/ECLAT Category Cover.jpg", 2200],
  ["eclat-classic", "Products/ECLAT/ECLAT CLASSIC.jpg", 1400],
  ["eclat-confort", "Products/ECLAT/ECLAT CONFORT.jpg", 1400],
  ["eclat-service", "Products/ECLAT/ECLAT SERVICE.jpg", 1400],
  ...["001", "002", "003", "004", "005", "006", "008", "009", "0010", "0011"].map(id => [`gallery-${id}`, `Gallery/gallery_${id}.jpg`, 1800]),
];

await mkdir(targetRoot, { recursive: true });
await mkdir(reviewRoot, { recursive: true });
const tiles = [];
for (const [index, [name, path, width]] of images.entries()) {
  const source = join(sourceRoot, path);
  const target = join(targetRoot, `${name}.optimized.webp`);
  const metadata = await sharp(source).metadata();
  try {
    await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 86 }).toFile(target);
  } catch (error) {
    if (!path.startsWith("Gallery/")) throw error;
    console.warn(`Skipped unreadable gallery photo ${path}: ${error.message}`);
    continue;
  }
  console.log(`${name}: ${metadata.width}x${metadata.height}, ${(await stat(source)).size} -> ${(await stat(target)).size} bytes`);
  const thumbnail = await sharp(source).rotate().resize(300, 220, { fit: "contain", background: "white" }).flatten({ background: "white" }).extend({ top: 10, bottom: 40, left: 10, right: 10, background: "white" }).png().toBuffer();
  const label = Buffer.from(`<svg width="320" height="270"><text x="12" y="255" font-family="Arial" font-size="15" fill="#111">${name}</text></svg>`);
  const cell = await sharp(thumbnail).composite([{ input: label }]).png().toBuffer();
  tiles.push({ input: cell, left: (index % 4) * 320, top: Math.floor(index / 4) * 270 });
}
await sharp({ create: { width: 1280, height: Math.ceil(images.length / 4) * 270, channels: 3, background: "#ddd" } }).composite(tiles).jpeg({ quality: 88 }).toFile(join(reviewRoot, "eddfa-contact-sheet.jpg"));
await copyFile(join(sourceRoot, "Branding", "certificat_veritas_EN442.pdf"), join(targetRoot, "certificat-veritas-en442.pdf"));
await copyFile(join(sourceRoot, "Branding", "logo.ico"), join(targetRoot, "logo.ico"));
