import { Router } from 'express';

const router = Router();

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

export default router;
