import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parsePlatePrompt, toOpenScad } from '../src/core.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const benchmarkPath = path.join(here, 'ood_prompts_v1.json');

export async function verifyKernel(outDir) {
  const cases = JSON.parse(await fs.readFile(benchmarkPath, 'utf8'));
  const valid = cases.filter((item) => item.kind === 'valid');
  await fs.mkdir(outDir, { recursive: true });

  const version = spawnSync('openscad', ['--version'], { encoding: 'utf8' });
  if (version.error?.code === 'ENOENT') {
    return {
      verdict: 'BLOCKED_EXTERNAL_OPENSCAD_NOT_INSTALLED',
      openscad_version: null,
      total: valid.length,
      passed: 0,
      rows: []
    };
  }

  const rows = [];
  for (const item of valid) {
    const spec = parsePlatePrompt(item.prompt);
    const scad = toOpenScad(spec);
    const scadPath = path.join(outDir, `${item.id}.scad`);
    const stlPath = path.join(outDir, `${item.id}.stl`);
    await fs.writeFile(scadPath, scad, 'utf8');
    const run = spawnSync('openscad', ['-o', stlPath, scadPath], { encoding: 'utf8' });
    let size = 0;
    try {
      size = (await fs.stat(stlPath)).size;
    } catch {
      size = 0;
    }
    rows.push({
      id: item.id,
      exit_code: run.status,
      stl_size_bytes: size,
      success: run.status === 0 && size > 0,
      stderr_tail: String(run.stderr ?? '').trim().split('\n').slice(-6).join('\n')
    });
  }

  const passed = rows.filter((row) => row.success).length;
  return {
    verdict: passed === valid.length ? 'PASS_OPENSCAD_EXECUTION' : 'FAIL_OPENSCAD_EXECUTION',
    openscad_version: `${version.stdout ?? ''}${version.stderr ?? ''}`.trim(),
    total: valid.length,
    passed,
    success_rate: passed / valid.length,
    rows
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(here, 'kernel-output');
  const result = await verifyKernel(outDir);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.verdict === 'FAIL_OPENSCAD_EXECUTION') process.exitCode = 1;
}
