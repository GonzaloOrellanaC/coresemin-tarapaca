/**
 * Migra imágenes/archivos de cada noticia (MongoDB) a OM Cloud Storage.
 *
 * Por cada noticia obtiene las referencias de imágenes (coverImage, gallery[],
 * blocks[].content donde type === 'image'), resuelve el archivo (disco local
 * en public/ o por URL remota), lo sube a OM Cloud Storage y guarda la
 * publicUrl resultante en la base de datos.
 *
 * virtualPath: /coresemin-tarapaca/news/<slug>/<nombre_archivo>/
 *
 * Es idempotente: salta referencias que ya apuntan a omcloudstorage.
 *
 * Uso:
 *   node scripts/migrate-images-to-cloud.cjs
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const dns = require('dns');
// Los routers locales rechazan consultas SRV; forzamos resolver público.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { uploadToCloudStorage } = require('../dist/src/services/cloudStorage');

const ROOT = path.join(__dirname, '..');
const LOG_PATH = path.join(__dirname, 'migrate_images_log.txt');
const RESULT_PATH = path.join(__dirname, 'migrate_images_results.json');

const BASE_VIRTUAL = '/coresemin-tarapaca/news';
const CLOUD_HOST = 'omcloudstorage.omtecnologia.cl';

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

const uploadCache = new Map(); // sourceKey -> publicUrl

function isCloudUrl(u) {
  return /omcloudstorage\.omtecnologia\.cl/i.test(String(u || ''));
}

function normalizeKey(ref) {
  const r = String(ref).trim();
  if (/^https?:\/\//i.test(r)) return r;
  return r.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^public\//, '');
}

function detectMime(buffer, name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (buffer.length >= 8) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'image/gif';
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    if (buffer.toString('ascii', 0, 5) === '%PDF-') return 'application/pdf';
  }
  const map = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf' };
  return map[ext] || 'application/octet-stream';
}

// Resuelve una referencia a { buffer, originalname, mimetype }
async function resolveSource(ref) {
  const r = String(ref).trim();
  if (/^https?:\/\//i.test(r)) {
    let res;
    try {
      res = await fetch(r);
    } catch (e) {
      throw new Error('Error de red al descargar ' + r + ': ' + e.message);
    }
    if (!res.ok) {
      // Fallback: si es el logo del WP antiguo (ruta ya 404), usar el logo local
      const logoLocal = path.join(ROOT, 'public', 'CORESEMIN-LOGO.png');
      if (fs.existsSync(logoLocal)) {
        const buffer = fs.readFileSync(logoLocal);
        const originalname = 'CORESEMIN-LOGO.png';
        const mimetype = detectMime(buffer, originalname);
        return { buffer, originalname, mimetype, fallback: true };
      }
      throw new Error('HTTP ' + res.status + ' al descargar ' + r);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    let originalname = 'archivo';
    try {
      const bn = decodeURIComponent(path.basename(new URL(r).pathname));
      if (bn && bn !== '.' && bn !== '/') originalname = bn;
    } catch (_) {}
    const mimetype = (res.headers.get('content-type') || '').split(';')[0] || detectMime(buffer, originalname);
    return { buffer, originalname, mimetype };
  }

  // Path local: normaliza y busca en <ROOT>/public/
  const normalized = r.replace(/\\/g, '/').replace(/^\/+/, '');
  let rel = normalized;
  if (rel.startsWith('public/')) rel = rel.slice('public/'.length);
  const disk = path.join(ROOT, 'public', rel);
  if (fs.existsSync(disk) && fs.statSync(disk).isFile()) {
    const buffer = fs.readFileSync(disk);
    const originalname = path.basename(disk);
    const mimetype = detectMime(buffer, originalname);
    return { buffer, originalname, mimetype };
  }

  // Fallback: si el archivo no está en disco, intentar descargarlo desde el
  // sitio público (p. ej. imágenes subidas vía admin al servidor de prod).
  try {
    const publicRel = normalized.replace(/^public\//, '');
    const url = 'https://coresemintarapaca.cl/' + publicRel;
    const res = await fetch(url);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      const originalname = path.basename(publicRel) || 'archivo';
      const mimetype = detectMime(buffer, originalname);
      return { buffer, originalname, mimetype };
    }
  } catch (_) { /* seguir con el error */ }

  throw new Error('Archivo local no encontrado: ' + r + ' (busqué en ' + disk + ')');
}

// Sube una referencia (con caché para no repetir archivos iguales)
async function uploadRef(ref, slug) {
  const key = normalizeKey(ref);
  if (uploadCache.has(key)) return { publicUrl: uploadCache.get(key), cached: true };
  const src = await resolveSource(ref);
  const base = path.basename(src.originalname, path.extname(src.originalname)) || 'archivo';
  const virtualPath = `${BASE_VIRTUAL}/${slug}/${base}/`;
  const cloud = await uploadToCloudStorage(src, virtualPath);
  uploadCache.set(key, cloud.publicUrl);
  return { publicUrl: cloud.publicUrl, cached: false };
}

async function migrateDoc(doc, col) {
  const slug = doc.slug;
  const changes = {};
  let updatedAny = false;
  let ok = 0, err = 0;

  // Portada
  if (doc.coverImage && !isCloudUrl(doc.coverImage)) {
    try {
      const r = await uploadRef(doc.coverImage, slug);
      changes.coverImage = r.publicUrl;
      updatedAny = true; ok++;
      log(`  coverImage -> ${r.publicUrl}${r.cached ? ' (cache)' : ''}`);
    } catch (e) { err++; log(`  coverImage ERROR: ${e.message}`); }
  }

  // Galería
  let gallery = Array.isArray(doc.gallery) ? [...doc.gallery] : [];
  let galleryChanged = false;
  for (let i = 0; i < gallery.length; i++) {
    const g = gallery[i];
    if (!g || isCloudUrl(g)) continue;
    try {
      const r = await uploadRef(g, slug);
      gallery[i] = r.publicUrl;
      galleryChanged = true; ok++;
      log(`  gallery[${i}] -> ${r.publicUrl}${r.cached ? ' (cache)' : ''}`);
    } catch (e) { err++; log(`  gallery[${i}] ERROR: ${e.message}`); }
  }
  if (galleryChanged) { changes.gallery = gallery; updatedAny = true; }

  // Bloques con imagen
  let blocks = Array.isArray(doc.blocks) ? doc.blocks.map((b) => ({ ...b })) : [];
  let blocksChanged = false;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b || b.type !== 'image' || !b.content || isCloudUrl(b.content)) continue;
    try {
      const r = await uploadRef(b.content, slug);
      blocks[i] = { ...b, content: r.publicUrl };
      blocksChanged = true; ok++;
      log(`  blocks[${i}] -> ${r.publicUrl}${r.cached ? ' (cache)' : ''}`);
    } catch (e) { err++; log(`  blocks[${i}] ERROR: ${e.message}`); }
  }
  if (blocksChanged) { changes.blocks = blocks; updatedAny = true; }

  if (updatedAny && Object.keys(changes).length) {
    await col.updateOne({ _id: doc._id }, { $set: changes });
  }
  return { ok, err, updated: updatedAny };
}

(async () => {
  log('Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const col = db.collection('news');
  const docs = await col.find({}).toArray();
  log('Total noticias: ' + docs.length);

  const results = [];
  let totalOk = 0, totalErr = 0, updatedDocs = 0;

  for (const doc of docs) {
    log('\n=== ' + doc.slug + ' ===');
    const r = await migrateDoc(doc, col);
    totalOk += r.ok; totalErr += r.err;
    if (r.updated) updatedDocs++;
    results.push({ slug: doc.slug, ok: r.ok, err: r.err, updated: r.updated });
    log(`--- ${doc.slug}: ${r.ok} ok, ${r.err} error${r.updated ? ', documento actualizado' : ''}`);
  }

  log('\n=== RESUMEN ===');
  log('Documentos actualizados: ' + updatedDocs + '/' + docs.length);
  log('Archivos subidos/reusados: ' + totalOk);
  log('Errores: ' + totalErr);

  await mongoose.disconnect();

  fs.writeFileSync(RESULT_PATH, JSON.stringify(results, null, 2), 'utf8');
  fs.writeFileSync(LOG_PATH, lines.join('\n'), 'utf8');
  console.log('\nResultados -> ' + RESULT_PATH);
  console.log('Log -> ' + LOG_PATH);
})().catch((e) => {
  log('FATAL: ' + (e && e.stack || e));
  try { fs.writeFileSync(LOG_PATH, lines.join('\n'), 'utf8'); } catch (_) {}
  console.error('FATAL', e);
  process.exit(1);
});
