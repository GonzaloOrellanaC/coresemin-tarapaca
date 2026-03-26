import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { PORT } from './config';
import { connectDB } from './db';
import newsRouter from './routes/news';
import authRouter from './routes/auth';
import sitemapRouter from './routes/sitemap';
import robotsRouter from './routes/robots';
import redirects from './middleware/redirects';

const Server = () => {
  const app = express();
  // Configure helmet with a Content Security Policy that allows the
  // specific inline script hash and trusted script/style sources.
  app.use(helmet({
    // Disable COEP so external CDNs (Tailwind CDN) are not blocked by embedder policies
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
          "'sha256-15kmg71PbbXQODa0lp55JVHZAuw48OCvXm8qApL/t7w='",
        ],
        connectSrc: [
          "'self'",
          'http://localhost:4173',
          'http://localhost:4000',
          'https://coresemintarapaca.cl', 
          "https://coresemin-tarapaca.omtecnologia.cl"
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https://coresemintarapaca.cl', 
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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads',
    (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    cors({ origin: 'https://coresemintarapaca.cl', credentials: true }),
    express.static(path.join(process.cwd(), 'uploads'))
  );
  // Serve public images folder (all subfolders and files) as static.
  // Use __dirname so path works when server process cwd is the server folder.
  const imagesDir = path.join(__dirname, '..', 'app', 'public', 'images');
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
    cors({ origin: 'https://coresemintarapaca.cl', credentials: true }),
    express.static(imagesDir)
  );

  // Redirects from old WordPress URLs
  app.use(redirects);

  const server = http.createServer(app);
  const io = new IOServer(server, {
    cors: {
      origin: ['https://coresemintarapaca.cl', 'https://coresemin-tarapaca.omtecnologia.cl', 'https://web.coresemintarapaca.cl', 'http://localhost:4173'],
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
    if (process.env.SERVER_MODE === 'server') {
      await connectDB();
    }
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  start().catch((err) => console.error(err));
}

export default Server;