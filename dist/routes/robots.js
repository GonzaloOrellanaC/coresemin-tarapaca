"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// GET /robots.txt
router.get('/robots.txt', (req, res) => {
    const host = req.protocol + '://' + req.get('host');
    const baseUrl = (process.env.FRONTEND_URL || host).replace(/\/$/, '');
    const lines = [
        'User-agent: *',
        'Allow: /',
        `Sitemap: ${baseUrl}/sitemap.xml`,
    ];
    res.type('text/plain').send(lines.join('\n'));
});
exports.default = router;
