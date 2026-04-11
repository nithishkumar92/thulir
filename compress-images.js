/**
 * compress-images.js
 * Compresses all gallery images in-place.
 * Target: JPEG/PNG → max 1200px wide, quality 75 → typically 100–400 KB
 * Run: node compress-images.js
 */

const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const GALLERY_DIR = path.join(__dirname, 'images', 'gallery');
const MAX_WIDTH   = 1200;   // resize if wider than this
const JPEG_Q      = 75;     // JPEG quality (75 = good balance of size/quality)
const PNG_Q       = 80;     // PNG quality

const SUPPORTED = ['.jpg', '.jpeg', '.png'];

async function compressFile(filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  if (!SUPPORTED.includes(ext)) return null;

  const before = fs.statSync(filePath).size;
  const tmp    = filePath + '.tmp';

  try {
    const img = sharp(filePath).resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.png') {
      await img.png({ quality: PNG_Q, compressionLevel: 8 }).toFile(tmp);
    } else {
      await img.jpeg({ quality: JPEG_Q, mozjpeg: true }).toFile(tmp);
    }

    fs.renameSync(tmp, filePath);           // replace original
    const after = fs.statSync(filePath).size;
    const saved = Math.round((before - after) / 1024);
    const pct   = Math.round(((before - after) / before) * 100);
    return { file: path.basename(filePath), before: Math.round(before/1024), after: Math.round(after/1024), saved, pct };
  } catch (err) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    console.error(`  ✗ Error on ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

async function walkAndCompress(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await walkAndCompress(full));
    } else {
      const r = await compressFile(full);
      if (r) {
        const sign = r.saved >= 0 ? '-' : '+';
        console.log(`  ${r.saved >= 0 ? '✓' : '~'} ${r.file.padEnd(45)} ${String(r.before).padStart(5)} KB → ${String(r.after).padStart(4)} KB  (${sign}${Math.abs(r.pct)}%)`);
        results.push(r);
      }
    }
  }
  return results;
}

(async () => {
  console.log(`\n📸 Compressing gallery images in: ${GALLERY_DIR}\n`);
  const results = await walkAndCompress(GALLERY_DIR);

  const totalBefore = results.reduce((s, r) => s + r.before, 0);
  const totalAfter  = results.reduce((s, r) => s + r.after,  0);
  const totalSaved  = totalBefore - totalAfter;

  console.log(`\n─────────────────────────────────────────────────`);
  console.log(`  Total before : ${Math.round(totalBefore/1024)} MB`);
  console.log(`  Total after  : ${Math.round(totalAfter/1024)} MB`);
  console.log(`  Space saved  : ${Math.round(totalSaved/1024)} MB (${Math.round((totalSaved/totalBefore)*100)}%)`);
  console.log(`  Files done   : ${results.length}`);
  console.log(`─────────────────────────────────────────────────\n`);
})();
