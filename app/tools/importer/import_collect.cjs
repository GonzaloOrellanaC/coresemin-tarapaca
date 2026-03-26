const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const INDEX_URL = 'https://coresemintarapaca.cl/noticias/';

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

function extractLinks(html) {
  const $ = cheerio.load(html);
  const anchors = new Set();
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (href.startsWith('https://coresemintarapaca.cl/') && !href.includes('/category/') && !href.includes('/noticias') && !href.endsWith('/page/') ) {
      anchors.add(href.split('#')[0]);
    }
  });
  return Array.from(anchors).filter(Boolean);
}

async function fetchArticle(url) {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const metaTitle = $('meta[property="og:title"]').attr('content') || $('h1').first().text();
    const metaImage = $('meta[property="og:image"]').attr('content') || $('img').first().attr('src');
    const metaDate = $('meta[property="article:published_time"]').attr('content') || $('time').first().attr('datetime') || new Date().toISOString();
    const author = $('meta[name="author"]').attr('content') || $('.author').first().text() || 'Coresemin';
    const paragraph = $('article p').first().text() || $('p').first().text() || '';
    let category = 'Noticia';
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
      coverImage: metaImage || '',
      publishDate: metaDate,
      author: author && author.trim(),
      subtitle: paragraph && paragraph.trim(),
      category,
      slug: slugify(metaTitle || '')
    };
  } catch (err) {
    console.error('Failed to fetch article', url, err.message);
    return null;
  }
}

async function main() {
  console.log('Fetching index', INDEX_URL);
  const html = await fetchIndex();
  const links = extractLinks(html);
  console.log('Found', links.length, 'links');

  const collected = [];
  for (const url of links) {
    console.log('Fetching', url);
    const art = await fetchArticle(url);
    if (art && art.title) collected.push(art);
    await new Promise(r => setTimeout(r, 200));
  }

  try {
    fs.writeFileSync('./tools/importer/collected_articles.json', JSON.stringify(collected, null, 2), 'utf8');
    console.log('Wrote ./tools/importer/collected_articles.json with', collected.length, 'items');
  } catch (err) {
    console.error('Failed to write JSON', err.message);
  }
}

main().catch(err => console.error(err));
