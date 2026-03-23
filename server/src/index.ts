import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { PORT } from './config';
import { connectDB } from './db';
import newsRouter from './routes/news';
import authRouter from './routes/auth';
import sitemapRouter from './routes/sitemap';
import robotsRouter from './routes/robots';
import redirects from './middleware/redirects';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Serve public images folder (all subfolders and files) as static.
// Use __dirname so path works when server process cwd is the server folder.
const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  console.warn('Warning: images directory not found at', imagesDir);
} else {
  console.log('Serving images from', imagesDir);
}
app.use('/images', express.static(imagesDir));

// Redirects from old WordPress URLs
app.use(redirects);

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });
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
  const staticPath = path.join(process.cwd(), 'dist');
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => console.error(err));
