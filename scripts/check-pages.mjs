import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.tsx');
const appSource = readFileSync(appPath, 'utf8');
const pageImports = [...appSource.matchAll(/import\(['"]@\/pages\/([^'"]+)['"]\)/g)];
const extensions = ['.tsx', '.ts', '.jsx', '.js'];
const missing = [];

for (const [, page] of pageImports) {
  const basePath = path.join(root, 'src', 'pages', page);
  if (!extensions.some((extension) => existsSync(`${basePath}${extension}`)) &&
      !extensions.some((extension) => existsSync(path.join(basePath, `index${extension}`)))) {
    missing.push(`src/pages/${page}`);
  }
}

if (missing.length) {
  console.error('Missing page imports:');
  for (const page of missing) console.error(`  - ${page}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${pageImports.length} page imports; all files exist.`);
}
