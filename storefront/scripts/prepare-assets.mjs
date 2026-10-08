import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";

const directory = join(process.cwd(), "archive", "reference-assets");
for (const file of await readdir(directory)) {
  if (!/\.(jpg|png|webp)$/i.test(file) || file.endsWith(".optimized.webp")) continue;
  const source = join(directory, file);
  const stem = parse(file).name;
  const target = join(directory, `${stem}.optimized.webp`);
  await sharp(source).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(target);
  console.log(`${file}: ${(await stat(source)).size} -> ${(await stat(target)).size} bytes`);
}
