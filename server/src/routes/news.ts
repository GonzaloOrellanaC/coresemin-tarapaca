import { Router } from 'express';
import multer from 'multer';
import { News } from '../models/News';
import { authenticate } from '../middleware/auth';
import { slugify } from '../utils/slugify';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// List all news
router.get('/', async (req, res) => {
  const list = await News.find().sort({ publishDate: -1 }).lean();
  res.json(list);
});

// Get by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const item = await News.findOne({ slug }).lean();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

// Create news (protected)
router.post('/', authenticate, upload.single('cover'), async (req, res) => {
  const data = req.body as any;
  if (!data.title || !data.category) return res.status(400).json({ message: 'title and category required' });
  const slug = slugify(data.title);
  const exists = await News.findOne({ slug });
  if (exists) return res.status(409).json({ message: 'slug already exists' });
  const doc = new News({
    slug,
    title: data.title,
    subtitle: data.subtitle,
    coverImage: data.coverImage || (req.file ? `/${req.file.path}` : undefined),
    author: data.author || 'Admin',
    publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
    category: data.category,
    blocks: data.blocks ? JSON.parse(data.blocks) : []
  });
  await doc.save();
  // emit via socket.io if available
  const io = req.app.get('io');
  if (io) io.emit('newsCreated', doc);
  res.status(201).json(doc);
});

export default router;
