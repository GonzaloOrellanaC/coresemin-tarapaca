import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { News } from '../models/News';
import { authenticate } from '../middleware/auth';
import { slugify } from '../utils/slugify';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const title = req.body.title || 'temp';
    const slug = slugify(title);
    // Path relative to server/src/routes/news.ts: ../../../app/public/images/slug
    const dir = path.join(process.cwd(), 'app', 'public', 'images', slug);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Preserve original extension but could normalize name
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${slugify(name)}${ext}`);
  }
});

const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'gallery', maxCount: 30 }
]);

// List all news
router.get('/', async (req, res) => {
  const list = await News.find().sort({ publishDate: -1 }).lean();
  const formatted = list.map(item => ({
    ...item,
    id: (item as any)._id.toString()
  }));
  res.json(formatted);
});

// Get by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const item = await News.findOne({ slug }).lean();
  if (!item) return res.status(404).json({ message: 'Not found' });
  
  const formatted = {
    ...item,
    id: (item as any)._id.toString()
  };
  res.json(formatted);
});

// Create news (protected)
router.post('/', authenticate, upload.any(), async (req, res) => {
  const data = req.body as any;
  const files = req.files as Express.Multer.File[];

  if (!data.title || !data.category) return res.status(400).json({ message: 'title and category required' });
  const slug = slugify(data.title);
  const exists = await News.findOne({ slug });
  if (exists) return res.status(409).json({ message: 'slug already exists' });

  const coverImageFile = files?.find(f => f.fieldname === 'coverImage');
  const galleryFiles = files?.filter(f => f.fieldname === 'gallery') || [];
  
  let blocks = data.blocks ? JSON.parse(data.blocks) : [];
  
  // Process block images
  blocks = blocks.map((block: any) => {
    if (block.type === 'image') {
      const file = files?.find(f => f.fieldname === `block_image_${block.id}`);
      if (file) {
        return { ...block, content: `/images/${slug}/${file.filename}` };
      }
    }
    return block;
  });

  const doc = new News({
    slug,
    title: data.title,
    subtitle: data.subtitle,
    coverImage: coverImageFile ? `/images/${slug}/${coverImageFile.filename}` : data.coverImage,
    gallery: galleryFiles.map(f => `/images/${slug}/${f.filename}`),
    author: data.author || 'Admin',
    publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
    category: data.category,
    blocks
  });
  await doc.save();
  // emit via socket.io if available
  const io = req.app.get('io');
  if (io) io.emit('newsCreated', doc);
  res.status(201).json(doc);
});

// Update news (protected)
router.put('/:id', authenticate, upload.any(), async (req, res) => {
  const { id } = req.params;
  const data = req.body as any;
  const files = req.files as Express.Multer.File[];

  if (!id || id === 'undefined') {
    return res.status(400).json({ message: 'Invalid ID provided' });
  }

  const item = await News.findById(id);
  if (!item) return res.status(404).json({ message: 'Not found' });

  const slug = data.title ? slugify(data.title) : item.slug;
  
  item.title = data.title || item.title;
  item.subtitle = data.subtitle !== undefined ? data.subtitle : item.subtitle;
  item.category = data.category || item.category;
  item.publishDate = data.publishDate ? new Date(data.publishDate) : item.publishDate;
  
  let blocks = data.blocks ? JSON.parse(data.blocks) : item.blocks;
  
  // Process block images
  blocks = blocks.map((block: any) => {
    if (block.type === 'image') {
      const file = files?.find(f => f.fieldname === `block_image_${block.id}`);
      if (file) {
        return { ...block, content: `/images/${slug}/${file.filename}` };
      }
    }
    return block;
  });
  
  item.blocks = blocks;
  
  const coverImageFile = files?.find(f => f.fieldname === 'coverImage');
  const galleryFiles = files?.filter(f => f.fieldname === 'gallery') || [];

  if (coverImageFile) {
    item.coverImage = `/images/${slug}/${coverImageFile.filename}`;
  } else if (data.coverImageUrl) {
    item.coverImage = data.coverImageUrl;
  }

  // Handle gallery: if existingGallery is provided, use it as baseline
  let currentGallery = data.existingGallery ? JSON.parse(data.existingGallery) : (item.gallery || []);
  const newGalleryPaths = galleryFiles.map(f => `/images/${slug}/${f.filename}`);
  item.gallery = [...currentGallery, ...newGalleryPaths];

  item.slug = slug;
  await item.save();

  const io = req.app.get('io');
  if (io) io.emit('newsUpdated', item);
  res.json(item);
});

// Delete news (protected)
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const item = await News.findByIdAndDelete(id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  
  // Optional: Delete images folder
  // const dir = path.join(process.cwd(), 'app', 'public', 'images', item.slug);
  // if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

  const io = req.app.get('io');
  if (io) io.emit('newsDeleted', { id });
  res.json({ message: 'Deleted successfully' });
});

export default router;
