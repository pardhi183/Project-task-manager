import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

let html = await fs.readFile(indexPath, 'utf8');

const cssLinks = [...html.matchAll(/<link rel="stylesheet" crossorigin href="([^"]+)">/g)];
for (const match of cssLinks) {
  const assetPath = path.join(distDir, match[1].replace(/^\//, ''));
  const css = (await fs.readFile(assetPath, 'utf8')).replaceAll('</style', '<\\/style');
  html = html.replace(match[0], () => `<style>\n${css}\n</style>`);
}

const moduleScripts = [...html.matchAll(/<script type="module" crossorigin src="([^"]+)"><\/script>/g)];
for (const match of moduleScripts) {
  const assetPath = path.join(distDir, match[1].replace(/^\//, ''));
  const js = (await fs.readFile(assetPath, 'utf8')).replaceAll('</script', '<\\/script');
  html = html.replace(match[0], () => `<script type="module">\n${js}\n</script>`);
}

await fs.writeFile(indexPath, html, 'utf8');
console.log('Inlined production CSS and JS into frontend/dist/index.html');
