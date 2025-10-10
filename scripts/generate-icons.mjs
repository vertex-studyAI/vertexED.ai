// Generates favicon and touch icons from public/logo.png using sharp
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = resolve(__dirname, '..');
const pub = resolve(root, 'public');
const src = resolve(pub, 'logo.png');

if (!existsSync(src)) {
  console.error('Source image not found:', src);
  process.exit(1);
}

const tasks = [
  { out: 'favicon-48x48.png', size: 48 },
  { out: 'favicon-32x32.png', size: 32 },
  { out: 'favicon-16x16.png', size: 16 },
  { out: 'apple-touch-icon.png', size: 180 },
];

(async () => {
  try {
    if (!existsSync(pub)) mkdirSync(pub, { recursive: true });

    for (const t of tasks) {
      const dest = resolve(pub, t.out);
      await sharp(src)
        .resize(t.size, t.size, { fit: 'cover' })
        .png({ quality: 90 })
        .toFile(dest);
      console.log('Wrote', dest);
    }

    console.log('All icons generated.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
