const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const API_BASE = process.env.API_URL || 'http://localhost:4000';
const INDEX_URL = 'https://coresemintarapaca.cl/noticias/';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function slugify(text) {
  if (!text) return '';
  let s = text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  s = s.replace(/ñ/g, 'n').replace(/Ñ/g, 'N');
  s = s.toLowerCase();
  s = s.replace(/[^a-z0-9\s-]/g, '');
  s = s.trim().replace(/\s+/g, '-');
  return s;
}

async function fetchIndex() {
  const res = await axios.get(INDEX_URL);
  return res.data;
}

  const env = readEnvServer();
  const adminUser = env.ADMIN_USER || 'admin';
  const adminPass = env.ADMIN_PASS || 'admin123';

  // fetch all articles and build items
  const collected = [];
  for (const url of links) {
    try {
      const art = await fetchArticle(url);
      if (!art || !art.title) continue;
      art.slug = slugify(art.title);
      art.url = url;
      collected.push(art);
    } catch (err) {
      console.error('Error fetching', url, err.message);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // write collected JSON
  try {
    fs.writeFileSync('./tools/importer/collected_articles.json', JSON.stringify(collected, null, 2), 'utf8');
    console.log('Wrote collected_articles.json with', collected.length, 'items');
  } catch (err) {
    console.error('Failed to write collected JSON', err.message);
  }

  const token = await login(adminUser, adminPass);
  if (!token) {
    console.error('No token, aborting import');
    process.exit(1);
  }

  const results = [];
  for (const art of collected) {
    console.log('Processing', art.url);
    try {
      // check if slug exists
      try {
        const check = await axios.get(`${API_BASE}/api/news/${art.slug}`);
        if (check && check.data) {
          console.log('Skipped (exists):', art.slug);
          results.push({ slug: art.slug, status: 'skipped', reason: 'exists' });
          continue;
        }
      } catch (e) {
        // if 404 then proceed
        if (!e.response || e.response.status !== 404) {
          console.warn('Check error for', art.slug, e.message);
        }
      }

      const created = await postArticle(art, token);
      if (created) {
        console.log('Imported:', art.title, '->', created.slug || created._id || '(created)');
        results.push({ slug: art.slug, status: 'created', id: created._id || created.slug || null });
      } else {
        results.push({ slug: art.slug, status: 'error' });
      }
    } catch (err) {
      console.error('Failed to process', art.url, err.message);
      results.push({ slug: art.slug, status: 'error', error: err.message });
    }
    await new Promise(r => setTimeout(r, 500));
  }

  try {
    fs.writeFileSync('./tools/importer/import_results.json', JSON.stringify(results, null, 2), 'utf8');
    console.log('Wrote import_results.json');
  } catch (err) {
    console.error('Failed to write results JSON', err.message);
  }

  console.log('Import finished');
    $('a').each((i, el) => {
      const h = $(el).attr('href') || '';
      if (h.includes('/category/')) {
        if (h.includes('eventos')) category = 'Evento';
        if (h.includes('capacitacion') || h.includes('capacitaciones')) category = 'Capacitación';
        if (h.includes('blog') || h.includes('blogs')) category = 'Blog';
      }
    });

    return {
      url,
      title: metaTitle && metaTitle.trim(),
      coverImage: metaImage,
      publishDate: metaDate,
      author: author && author.trim(),
      subtitle: paragraph && paragraph.trim(),
      category
    };
  } catch (err) {
    console.error('Failed to fetch article', url, err.message);
    return null;
  }
}

async function login(adminUser, adminPass) {
  try {
    const res = await axios.post(`${API_BASE}/api/auth/login`, { username: adminUser, password: adminPass });
    return res.data.token;
  } catch (err) {
    console.error('Login failed', err.message);
    return null;
  }
}

async function postArticle(item, token) {
  try {
    const blocks = [{ id: generateId(), type: 'text', content: item.subtitle || '' }];
    const body = {
      title: item.title,
      subtitle: item.subtitle || '',
      coverImage: item.coverImage || '',
      author: item.author || 'Coresemin',
      publishDate: item.publishDate || new Date().toISOString(),
      category: item.category,
      blocks: JSON.stringify(blocks)
    };
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(`${API_BASE}/api/news`, body, { headers });
    return res.data;
  } catch (err) {
    console.error('Failed to post article', item.url, err.response ? err.response.data : err.message);
    return null;
  }
}

function readEnvServer() {
  try {
    const p = './server/.env';
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

async function main() {
  console.log('Fetching index', INDEX_URL);
  const html = await fetchIndex();
  const links = extractLinks(html);
  console.log('Found', links.length, 'links');

  const env = readEnvServer();
  const adminUser = env.ADMIN_USER || 'admin';
  const adminPass = env.ADMIN_PASS || 'admin123';

  const token = await login(adminUser, adminPass);
  if (!token) {
    console.error('No token, aborting import');
    process.exit(1);
  }

  for (const url of links) {
    console.log('Processing', url);
    const art = await fetchArticle(url);
    if (!art || !art.title) continue;
    art.slug = slugify(art.title);
    const created = await postArticle(art, token);
    if (created) console.log('Imported:', art.title, '->', created.slug || created._id || '(created)');
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('Import finished');
}

main().catch(err => console.error(err));
