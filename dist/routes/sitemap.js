"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const News_1 = require("../models/News");
const router = (0, express_1.Router)();
// GET /sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
    try {
        const host = req.protocol + '://' + req.get('host');
        const baseUrl = process.env.FRONTEND_URL || host; // allow override
        const items = await News_1.News.find({}, 'slug publishDate').sort({ publishDate: -1 }).lean();
        const urls = items.map((it) => {
            const loc = `${baseUrl.replace(/\/$/, '')}/noticia/${it.slug}`;
            const lastmod = new Date(it.publishDate || Date.now()).toISOString();
            return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
        });
        // also add static pages
        const staticPages = ['/', '/nosotros', '/noticias', '/eventos', '/blogs', '/contacto'];
        const staticUrls = staticPages.map(p => `  <url>\n    <loc>${baseUrl.replace(/\/$/, '')}${p}</loc>\n  </url>`);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls.join('\n')}\n${urls.join('\n')}\n</urlset>`;
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    }
    catch (err) {
        console.error('Failed to generate sitemap', err);
        res.status(500).send('Server error');
    }
});
exports.default = router;
