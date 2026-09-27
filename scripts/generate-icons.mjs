// The small-size network mark is distinct from the preserved full brand logo.
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = resolve(__dirname, '..');
const pub = resolve(root, 'public');
const src = resolve(pub, 'app-mark.svg');

if (!existsSync(src)) {
  console.error('Source image not found:', src);
  process.exit(1);
}

const tasks = [
  { out: 'favicon-48x48.png', size: 48 },
  { out: 'favicon-32x32.png', size: 32 },
  { out: 'favicon-16x16.png', size: 16 },
  { out: 'apple-touch-icon.png', size: 180 },
  { out: 'icon-192.png', size: 192 },
  { out: 'icon-512.png', size: 512 },
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

    // Maskable icons keep every identifying stroke inside the central 80%.
    const mark = await sharp(src).resize(352, 352).png().toBuffer();
    await sharp({ create: { width: 512, height: 512, channels: 4, background: '#1959b3' } })
      .composite([{ input: mark, gravity: 'centre' }]).png().toFile(resolve(pub, 'icon-maskable-512.png'));

    // ICO supports PNG entries; keep actual 16, 32 and 48px images for browsers
    // that request /favicon.ico directly instead of reading the HTML metadata.
    const sizes = [16, 32, 48];
    const images = await Promise.all(sizes.map(size => sharp(src).resize(size, size).png().toBuffer()));
    const header = Buffer.alloc(6 + 16 * images.length);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);
    let offset = header.length;
    images.forEach((data, index) => {
      const entry = 6 + index * 16;
      header[entry] = sizes[index];
      header[entry + 1] = sizes[index];
      header.writeUInt16LE(1, entry + 4);
      header.writeUInt16LE(32, entry + 6);
      header.writeUInt32LE(data.length, entry + 8);
      header.writeUInt32LE(offset, entry + 12);
      offset += data.length;
    });
    writeFileSync(resolve(pub, 'favicon.ico'), Buffer.concat([header, ...images]));

    console.log('All icons generated.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
