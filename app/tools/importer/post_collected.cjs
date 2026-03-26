const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'http://localhost:4000';
const COLLECTED = path.join(__dirname, 'collected_articles.json');
const OUT = path.join(__dirname, 'import_results.json');

function slugify(text) {
  if (!text) return '';
  try {
    let s = text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    s = s.replace(/ñ/g, 'n').replace(/Ñ/g, 'N');
    s = s.toLowerCase();
    s = s.replace(/[^a-z0-9\s-]/g, '');
    s = s.trim().replace(/\s+/g, '-');
    return s;
  } catch (e) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }
}

function readEnvServer() {
  try {
    const p = path.join(__dirname, '..', '..', 'server', '.env');
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split(/\r?\n/);
      const env = {};
      for (const line of lines) {
        const m = line.match(/^([^=]+)=(.*)$/);
        if (m) env[m[1].trim()] = m[2].trim();
      }
      return env;
    }
  } catch (err) {
    // ignore
  }
  return {};
}

async function login(user, pass) {
  try {
    const res = await axios.post(`${API_BASE}/api/auth/login`, { username: user, password: pass });
    return res.data && res.data.token ? res.data.token : null;
  } catch (err) {
    console.error('Login failed', err.response ? err.response.data : err.message);
    return null;
  }
}

async function checkExists(slug) {
  try {
    const res = await axios.get(`${API_BASE}/api/news/${slug}`);
    return !!(res && res.data);
  } catch (err) {
    if (err.response && err.response.status === 404) return false;
    console.warn('Check exists error for', slug, err.message);
    return false;
  }
}

async function postArticle(item, token) {
  try {
    // try to fetch full article HTML and extract paragraphs inside .content-inner
    let blocks = [];
    try {
      if (item.url) {
        const res = await axios.get(item.url, { timeout: 15000 });
        const $ = cheerio.load(res.data);
        const container = $('.content-inner').first();
        if (container && container.length) {
          container.find('p').each((i, el) => {
            const inner = $(el).html() || $(el).text() || '';
            if (inner && inner.trim()) {
              blocks.push({ id: Date.now().toString(36) + '-' + i, type: 'text', content: inner.trim() });
            }
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch article HTML for blocks, falling back to subtitle:', item.url, err.message || err);
    }

    if (!blocks.length) {
      blocks = [{ id: Date.now().toString(36), type: 'text', content: item.subtitle || '' }];
    }
    const body = {
      title: item.title,
      subtitle: item.subtitle || '',
      coverImage: item.coverImage || '',
      author: item.author || 'Coresemin',
      publishDate: item.publishDate || new Date().toISOString(),
      category: item.category || 'Noticia',
      blocks: JSON.stringify(blocks)
    };
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(`${API_BASE}/api/news`, body, { headers });
    return res.data;
  } catch (err) {
    console.error('Failed to post article', item.url || item.title, err.response ? err.response.data : err.message);
    return null;
  }
}

async function run() {
  if (!fs.existsSync(COLLECTED)) {
    console.error('Collected JSON not found at', COLLECTED);
    process.exit(1);
  }

  const raw = fs.readFileSync(COLLECTED, 'utf8');
  let items = [];
  try { items = JSON.parse(raw); } catch (e) { console.error('Invalid JSON', e.message); process.exit(1); }

  console.log('Found', items.length, 'items in collected JSON');

  const env = readEnvServer();
  const adminUser = env.ADMIN_USER || process.env.ADMIN_USER || 'admin';
  const adminPass = env.ADMIN_PASS || process.env.ADMIN_PASS || 'admin123';

  const token = await login(adminUser, adminPass);
  if (!token) { console.error('Auth failed; ensure server is running and credentials valid'); process.exit(1); }

  const results = [];
  for (const it of items) {
    const s = it.slug || slugify(it.title || '');
    const exists = await checkExists(s);
    if (exists) {
      console.log('Skip (exists):', s);
      results.push({ slug: s, status: 'skipped' });
      continue;
    }
    const created = await postArticle(it, token);
    if (created) {
      console.log('Imported:', it.title, '->', created.slug || created._id || '(created)');
      results.push({ slug: s, status: 'created', id: created._id || created.slug || null });
    } else {
      results.push({ slug: s, status: 'error' });
    }
    await new Promise(r => setTimeout(r, 300));
  }

  try { fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8'); console.log('Wrote', OUT); } catch (e) { console.error('Failed to write results', e.message); }
}

run().catch(err => { console.error(err); process.exit(1); });
