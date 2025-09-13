import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const target = join(__dirname, '..', 'dist', 'cli', 'index.js');

try {
  const src = readFileSync(target, 'utf8');
  const lines = src.split('\n');
  if (lines[0].includes('/usr/bin/env bun')) {
    lines[0] = '#!/usr/bin/env node';
    // Remove Bun hint if present
    if (lines[1] && lines[1].includes('@bun')) {
      lines.splice(1, 1);
    }
    writeFileSync(target, lines.join('\n'));
    console.log('Fixed CLI shebang to use node');
  }
} catch (err) {
  console.error('fix-shebang: skipped (file missing?)', err?.message || err);
}

