// scripts/update-version.js
// Updates src/version.js from git commit metadata
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionFilePath = join(__dirname, '../src/version.js');

try {
  const commit = execSync('git rev-parse --short HEAD').toString().trim();
  const date = execSync('git log -1 --format="%cd" --date=format:"%Y-%m-%d %H:%M"').toString().trim();
  const content = `// src/version.js
// Auto-generated build version metadata from git
export const BUILD_INFO = {
  commit: '${commit}',
  date: '${date}'
};
`;
  writeFileSync(versionFilePath, content, 'utf8');
  console.log(`Version updated: ${commit} · ${date}`);
} catch (err) {
  console.warn('Failed to update version from git:', err.message);
}
