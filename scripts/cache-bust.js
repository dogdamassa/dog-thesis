#!/usr/bin/env node
/*
 * cache-bust.js — carimba um hash do conteúdo em cada referência local de
 * .css / .js e imagens locais dentro dos *.html
 * (ex.: /styles.css -> /styles.css?v=ab12cd34ef).
 *
 * Por quê: as URLs dos assets nunca mudavam, então o navegador (e caches
 * intermediários) continuavam servindo a versão velha até o usuário dar
 * CMD+Shift+R. Com o hash na URL, quando o arquivo muda a URL muda, e o
 * navegador é OBRIGADO a baixar a versão nova — sem hard refresh.
 *
 * Roda automaticamente no build do Vercel (ver "buildCommand" em vercel.json).
 * É idempotente: remove um ?v= antigo antes de aplicar o atual.
 * Referências que não são arquivos locais (ex.: /_vercel/insights/script.js)
 * ficam intactas.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const hashCache = new Map();

function hashFor(assetPath) {
  if (hashCache.has(assetPath)) return hashCache.get(assetPath);
  let h = null;
  try {
    const buf = fs.readFileSync(path.join(root, assetPath));
    h = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
  } catch {
    h = null; // não é um arquivo local -> deixa como está
  }
  hashCache.set(assetPath, h);
  return h;
}

const extensions = 'css|js|png|jpe?g|webp|gif|svg|ico|m3u8|vtt';
// Atributos locais absolutos ou relativos: href, src e poster.
const localRe = new RegExp(
  `((?:href|src|poster)=")((?:/)?[a-zA-Z0-9_./-]+\\.(?:${extensions}))(?:\\?v=[a-zA-Z0-9_-]+)?(")`,
  'g'
);
// URLs canônicas em metadados/JSON-LD (og:image, twitter:image, logo etc.).
const canonicalRe = new RegExp(
  `("https://dogarmy\\.space/)([a-zA-Z0-9_./-]+\\.(?:${extensions}))(?:\\?v=[a-zA-Z0-9_-]+)?(")`,
  'g'
);

const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
let total = 0;

for (const file of htmlFiles) {
  const abs = path.join(root, file);
  const src = fs.readFileSync(abs, 'utf8');
  let count = 0;
  let out = src.replace(localRe, (m, pre, assetPath, post) => {
    const h = hashFor(assetPath.replace(/^\//, ''));
    if (!h) return m;
    count++;
    return `${pre}${assetPath}?v=${h}${post}`;
  });
  out = out.replace(canonicalRe, (m, pre, assetPath, post) => {
    const h = hashFor(assetPath);
    if (!h) return m;
    count++;
    return `${pre}${assetPath}?v=${h}${post}`;
  });
  if (out !== src) fs.writeFileSync(abs, out);
  if (count) {
    total += count;
    console.log(`  ${file}: ${count} ref(s)`);
  }
}

console.log(`cache-bust: ${total} referência(s) carimbada(s) em ${htmlFiles.length} arquivo(s) html`);
