import sharp from 'sharp';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Original abstract revision trace. No stock footage or learner data.
const scratch = await mkdtemp(join(tmpdir(), 'vertexed-trace-'));
await mkdir('public/media', { recursive: true });
const svg = progress => {
  const angle = progress * Math.PI * 2;
  const x = 384 + Math.cos(angle) * 240, y = 192 + Math.sin(angle) * 110;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="384" viewBox="0 0 768 384"><defs><radialGradient id="light"><stop stop-color="#639eff" stop-opacity=".65"/><stop offset="1" stop-color="#071631" stop-opacity="0"/></radialGradient></defs><rect width="768" height="384" fill="#071631"/><ellipse cx="${x}" cy="${y}" rx="230" ry="180" fill="url(#light)"/>${Array.from({ length: 14 }, (_, i) => `<ellipse cx="384" cy="192" rx="${80 + i * 19}" ry="${40 + i * 7}" fill="none" stroke="#8ab6ff" stroke-opacity="${.07 + i * .012}" transform="rotate(${progress * 30 + i * 2} 384 192)"/>`).join('')}<circle cx="${x}" cy="${y}" r="5" fill="#e2efff"/></svg>`;
};
try {
  await writeFile('public/media/revision-trace-poster.svg', svg(.2));
  for (let i = 0; i < 72; i++) await sharp(Buffer.from(svg(i / 71))).png().toFile(join(scratch, `${String(i).padStart(3, '0')}.png`));
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '18', '-i', join(scratch, '%03d.png'), '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-g', '9', '-pix_fmt', 'yuv420p', '-an', 'public/media/revision-trace.webm'], { stdio: 'inherit' });
  console.log('Generated original four-second revision trace and SVG poster.');
} finally { await rm(scratch, { recursive: true, force: true }); }
