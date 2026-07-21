import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { PORT } from './config';
import newsRouter from './routes/news';
import authRouter from './routes/auth';
import sitemapRouter from './routes/sitemap';
import robotsRouter from './routes/robots';
import redirects from './middleware/redirects';
import { getDb } from './db/database';


const Server = () => {
  const app = express();
  const origin = ['https://coresemintarapaca.cl', 'https://www.coresemintarapaca.cl', 'http://localhost:4000', 'http://localhost:4173']
  // Configure helmet with a Content Security Policy that allows the
  // specific inline script hash and trusted script/style sources.
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://coresemin-tarapaca.omtecnologia.cl",
          'https://cdn.tailwindcss.com',
          'http://localhost:4173',
          'http://localhost:4000',
          'https://coresemintarapaca.cl',
          'https://www.coresemintarapaca.cl',
          "'sha256-15kmg71PbbXQODa0lp55JVHZAuw48OCvXm8qApL/t7w='",
        ],
        connectSrc: [
          "'self'",
          'http://localhost:4173',
          'http://localhost:4000',
          'https://coresemintarapaca.cl', 
          'https://www.coresemintarapaca.cl',
          "https://coresemin-tarapaca.omtecnologia.cl"
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://coresemintarapaca.cl', 
          'https://www.coresemintarapaca.cl',
          "https://coresemin-tarapaca.omtecnologia.cl"
        ],
        styleSrc: [
          "'self'",
          'https://cdn.tailwindcss.com',
          'https://fonts.googleapis.com',
          "'unsafe-inline'",
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        objectSrc: ["'none'"],
      },
    },
  }));

  // Allow CORS from the frontend dev server, the production domain and the Tailwind CDN
  const allowedOrigins = [
    'http://localhost:4000',
    'http://localhost:4173',
    'https://coresemintarapaca.cl',
    'https://www.coresemintarapaca.cl',
    'https://cdn.tailwindcss.com',
    "https://coresemin-tarapaca.omtecnologia.cl"
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS policy: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use('/uploads',
    (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    cors({ origin, credentials: true }),
    express.static(path.join(process.cwd(), 'uploads'))
  );

  app.use('/public',
    (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    cors({ origin, credentials: true }),
    express.static(path.join(process.cwd(), 'public'))
  );
  // Serve public images folder (all subfolders and files) as static.
  // Use __dirname so path works when server process cwd is the server folder.
  const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');
  console.log(imagesDir)
  if (!fs.existsSync(imagesDir)) {
    console.warn('Warning: images directory not found at', imagesDir);
  } else {
    console.log('Serving images from', imagesDir);
  }
  app.use('/images',
    (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    cors({ origin, credentials: true }),
    express.static(imagesDir)
  );

  // Redirects from old WordPress URLs
  app.use(redirects);

  const server = http.createServer(app);
  const io = new IOServer(server, {
    cors: {
      origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
  });

  app.use('/api/news', newsRouter);
  app.use('/api/auth', authRouter);
  app.use('/', sitemapRouter);
  app.use('/', robotsRouter);

  // Handle SEO meta tags for noticia/:slug requests (WhatsApp, Facebook, X, LinkedIn, etc.)
  const handleNewsSeo = async (req: express.Request, res: express.Response, slug: string) => {
    try {
      const db = await getDb();
      const article = db.data.news.find(n => n.slug === slug);
      
      const staticPath = path.join(process.cwd(), 'app', 'dist');
      const devIndexPath = path.join(process.cwd(), 'app', 'index.html');
      const indexPath = fs.existsSync(path.join(staticPath, 'index.html')) ? path.join(staticPath, 'index.html') : devIndexPath;

      if (!fs.existsSync(indexPath)) {
        return res.status(404).send('Not found');
      }

      let html = fs.readFileSync(indexPath, 'utf-8');

      if (article) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.get('host') || 'coresemintarapaca.cl';
        const baseUrl = `${protocol}://${host}`.replace(/\/$/, '');

        const title = `${article.title} - Coresemin Tarapacá`;
        const rawDesc = article.subtitle || article.blocks?.find((b: any) => b.type === 'text')?.content || 'Noticia de Coresemin Tarapacá';
        const description = rawDesc.replace(/<[^>]*>/g, '').replace(/"/g, '&quot;').trim().slice(0, 200);

        let coverImgUrl = article.coverImage || '/public/CORESEMIN-LOGO.png';
        if (!coverImgUrl.startsWith('http')) {
          coverImgUrl = `${baseUrl}${coverImgUrl.startsWith('/') ? '' : '/'}${coverImgUrl}`;
        }

        const fullUrl = `${baseUrl}/noticia/${article.slug}`;

        const seoMetaTags = `
    <!-- Dynamic OpenGraph & Twitter SEO -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Coresemin Tarapacá" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${coverImgUrl}" />
    <meta property="og:image:secure_url" content="${coverImgUrl}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${coverImgUrl}" />
`;

        html = html.replace(/<title>.*?<\/title>/gi, '');
        html = html.replace(/<meta\s+(?:name|property)=["'](?:description|og:|twitter:)[^>]*>/gi, '');
        html = html.replace('</head>', `${seoMetaTags}\n</head>`);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      }

      return res.sendFile(indexPath);
    } catch (err) {
      console.error('Error serving SEO meta tags:', err);
      const staticPath = path.join(process.cwd(), 'app', 'dist');
      const indexPath = path.join(staticPath, 'index.html');
      if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
      return res.status(500).send('Server error');
    }
  };

  app.get(['/noticia/:slug', '/noticia/:slug/'], (req, res) => {
    return handleNewsSeo(req, res, req.params.slug);
  });

  // Serve frontend in production (assumes Vite build output in /dist)
  if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(process.cwd(), 'app', 'dist');
    console.log('Serving static files from', staticPath);
    app.use(express.static(staticPath));
    // Only serve index.html for navigation requests (HTML) — avoid returning index.html
    // for requests to asset files (css/js) which would cause wrong MIME types.
    app.get('*', (req, res, next) => {
      console.log('Received request for', req.path, 'with Accept header:', req.headers.accept);
      const accept = req.headers.accept || '';
      if (req.method !== 'GET') return next();
      // If the request looks like it accepts HTML, return index.html
      if (accept.includes('text/html')) {
        return res.sendFile(path.join(staticPath, 'index.html'));
      }
      return next();
    });
  }

  async function start() {
    console.log('Starting server in mode:', process.env.SERVER_MODE);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  start().catch((err) => console.error(err));
}

export default Server;