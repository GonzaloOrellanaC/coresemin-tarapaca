import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

let mapping: Record<string, string> = {};
try {
  const p = path.join(process.cwd(), 'server', 'redirects.json');
  if (fs.existsSync(p)) {
    mapping = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
} catch (err) {
  console.warn('Failed to load redirects.json', err);
}

export default function redirects(req: Request, res: Response, next: NextFunction) {
  const full = req.protocol + '://' + req.get('host') + req.originalUrl;
  const pathOnly = req.originalUrl;
  if (mapping[full]) return res.redirect(301, mapping[full]);
  if (mapping[pathOnly]) return res.redirect(301, mapping[pathOnly]);
  // also try with and without trailing slash
  if (!pathOnly.endsWith('/') && mapping[pathOnly + '/']) return res.redirect(301, mapping[pathOnly + '/']);
  if (pathOnly.endsWith('/') && mapping[pathOnly.slice(0, -1)]) return res.redirect(301, mapping[pathOnly.slice(0, -1)]);
  next();
}
