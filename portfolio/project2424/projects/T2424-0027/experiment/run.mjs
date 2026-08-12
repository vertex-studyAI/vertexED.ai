import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runLatentLanguageAudit } from '../src/core.mjs';

const result = runLatentLanguageAudit();
const outputPath = process.argv[2];
if (outputPath) {
  await writeFile(resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}
console.log(JSON.stringify(result, null, 2));
