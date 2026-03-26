const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function fetchHtml(url) {
  const res = await axios.get(url, { timeout: 15000 });
  return res.data;
}

function makeId() {
  return Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function downloadImage(url, destPath) {
  const writer = fs.createWriteStream(destPath);
  const res = await axios.get(url, { responseType: 'stream', timeout: 20000 });
  return new Promise((resolve, reject) => {
    res.data.pipe(writer);
    let error = null;
    writer.on('error', err => { error = err; writer.close(); reject(err); });
    writer.on('close', () => { if (!error) resolve(); });
  });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9._-]/gi, '_');
}

async function main() {
  const inputUrl = process.argv[2] || 'https://coresemintarapaca.cl/encuentro-de-comites-paritarios-coresemin-2025/';
  console.log('Fetching page:', inputUrl);

  const html = await fetchHtml(inputUrl);
  const $ = cheerio.load(html);

  const srcs = new Set();
  $('img').each((i, el) => {
    const s = $(el).attr('src') || $(el).attr('data-src') || '';
    if (s && !s.startsWith('data:')) srcs.add(s);
  });

  if (srcs.size === 0) {
    console.log('No images found on page.');
    return;
  }

  const imagesBase = path.join(process.cwd(), 'public', 'images');
  ensureDir(imagesBase);
  const runId = makeId();
  const outDir = path.join(imagesBase, runId);
  ensureDir(outDir);

  console.log(`Downloading ${srcs.size} images into ${path.relative(process.cwd(), outDir)} ...`);

  const results = [];
  let idx = 0;
  for (const s of Array.from(srcs)) {
    idx += 1;
    try {
      const resolved = new URL(s, inputUrl).href;
      const parsed = new URL(resolved);
      let filename = path.basename(parsed.pathname) || `img-${idx}.jpg`;
      filename = sanitizeFilename(filename);
      // if filename already exists, prefix index
      if (fs.existsSync(path.join(outDir, filename))) {
        filename = `${idx}-${filename}`;
      }
      const dest = path.join(outDir, filename);
      await downloadImage(resolved, dest);
      console.log(`Saved ${filename}`);
      results.push({ src: s, url: resolved, file: `images/${runId}/${filename}` });
    } catch (err) {
      console.warn('Failed to download', s, err.message || err);
      results.push({ src: s, error: err.message || String(err) });
    }
  }

  // write manifest
  const manifestPath = path.join(outDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ id: runId, source: inputUrl, createdAt: new Date().toISOString(), items: results }, null, 2), 'utf8');
  console.log('Wrote manifest:', path.relative(process.cwd(), manifestPath));
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
