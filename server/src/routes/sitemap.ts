import { Router } from 'express';
import { getDb } from '../db/database';

const router = Router();

// GET /sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const host = req.protocol + '://' + req.get('host');
    const baseUrl = process.env.FRONTEND_URL || host; // allow override
    
    const db = await getDb();
    const items = [...db.data.news].sort((a, b) => {
      const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
      const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
      return dateB - dateA;
    });

    const urls = items.map((it) => {
      const loc = `${baseUrl.replace(/\/$/, '')}/noticia/${it.slug}`;
      const lastmod = it.publishDate ? new Date(it.publishDate).toISOString() : new Date().toISOString();
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    });

    // also add static pages
    const staticPages = ['/', '/nosotros', '/noticias', '/eventos', '/blogs', '/contacto'];
    const staticUrls = staticPages.map(p => `  <url>\n    <loc>${baseUrl.replace(/\/$/, '')}${p}</loc>\n  </url>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls.join('\n')}\n${urls.join('\n')}\n</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Failed to generate sitemap', err);
    res.status(500).send('Server error');
  }
});

export default router;
