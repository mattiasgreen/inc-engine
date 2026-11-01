// scripts/update-version.js
// Updates src/version.js, index.html, and sw.js from git commit metadata
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const versionFilePath = join(rootDir, 'src/version.js');
const indexHtmlPath = join(rootDir, 'index.html');
const swJsPath = join(rootDir, 'sw.js');

try {
  const commit = execSync('git rev-parse --short HEAD').toString().trim();
  const date = execSync('git log -1 --format="%cd" --date=format:"%Y-%m-%d %H:%M"').toString().trim();

  // 1. Update src/version.js
  const versionContent = `// src/version.js
// Auto-generated build version metadata from git
export const BUILD_INFO = {
  commit: '${commit}',
  date: '${date}'
};
`;
  writeFileSync(versionFilePath, versionContent, 'utf8');

  // 2. Update index.html script tag with cache-buster query
  let indexHtml = readFileSync(indexHtmlPath, 'utf8');
  indexHtml = indexHtml.replace(
    /<script type="module" src="\.\/src\/ui\/app\.js(\?v=[a-zA-Z0-9_-]+)?"><\/script>/,
    `<script type="module" src="./src/ui/app.js?v=${commit}"></script>`
  );
  writeFileSync(indexHtmlPath, indexHtml, 'utf8');

  // 3. Update sw.js CACHE_NAME to invalidate stale PWA service worker cache
  let swJs = readFileSync(swJsPath, 'utf8');
  swJs = swJs.replace(
    /const CACHE_NAME = 'inc-engine-[^']+';/,
    `const CACHE_NAME = 'inc-engine-${commit}';`
  );
  writeFileSync(swJsPath, swJs, 'utf8');

  console.log(`Version updated across version.js, index.html, and sw.js: ${commit} · ${date}`);
} catch (err) {
  console.warn('Failed to update version from git:', err.message);
}

