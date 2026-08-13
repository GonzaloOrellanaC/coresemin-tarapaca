import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { slugify } from '../utils/slugify';
import { News } from '../models/News';
import { uploadToCloudStorage } from '../services/cloudStorage';

const router = Router();

// Los archivos se cargan en memoria y se suben a OM Cloud Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB por archivo
});

// Sube un archivo recibido (en memoria) a OM Cloud Storage y devuelve la
// URL pública que se guardará en la base de datos.
async function uploadFileToCloud(file: Express.Multer.File, virtualPath: string): Promise<string> {
  const cloud = await uploadToCloudStorage(file, virtualPath);
  return cloud.publicUrl;
}

// List all news
router.get('/', async (req, res) => {
  const list = await News.find().sort({ publishDate: -1 });
  res.json(list);
});

// Get by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const item = await News.findOne({ slug });
  if (!item) return res.status(404).json({ message: 'Not found' });
  
  res.json(item);
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

  const virtualPath = `/noticias/${slug}/`;

  try {
    // Portada
    let coverImage = data.coverImage;
    if (coverImageFile) {
      coverImage = await uploadFileToCloud(coverImageFile, virtualPath);
    }

    // Galería
    const gallery: string[] = [];
    for (const f of galleryFiles) {
      gallery.push(await uploadFileToCloud(f, virtualPath));
    }

    // Bloques con imagen
    let blocks = data.blocks ? JSON.parse(data.blocks) : [];
    blocks = await Promise.all(blocks.map(async (block: any) => {
      if (block.type === 'image') {
        const file = files?.find(f => f.fieldname === `block_image_${block.id}`);
        if (file) {
          const url = await uploadFileToCloud(file, virtualPath);
          return { ...block, content: url };
        }
      }
      return block;
    }));

    const doc = {
      slug,
      title: data.title,
      subtitle: data.subtitle,
      coverImage,
      gallery,
      author: data.author || 'Admin',
      publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
      category: data.category,
      blocks
    };

    const created = await News.create(doc);

    // emit via socket.io if available
    const io = req.app.get('io');
    if (io) io.emit('newsCreated', created);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(502).json({ message: `Error al subir archivos a OM Cloud Storage: ${err?.message || err}` });
  }
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
  const virtualPath = `/noticias/${slug}/`;

  item.title = data.title || item.title;
  item.subtitle = data.subtitle !== undefined ? data.subtitle : item.subtitle;
  item.category = data.category || item.category;
  item.publishDate = data.publishDate ? new Date(data.publishDate) : item.publishDate;

  const coverImageFile = files?.find(f => f.fieldname === 'coverImage');
  const galleryFiles = files?.filter(f => f.fieldname === 'gallery') || [];

  try {
    // Portada: si viene un archivo nuevo se sube al storage
    if (coverImageFile) {
      item.coverImage = await uploadFileToCloud(coverImageFile, virtualPath);
    } else if (data.coverImageUrl) {
      item.coverImage = data.coverImageUrl;
    }

    // Galería: conserva las existentes y sube las nuevas al storage
    let currentGallery = data.existingGallery ? JSON.parse(data.existingGallery) : (item.gallery || []);
    const newGalleryPaths: string[] = [];
    for (const f of galleryFiles) {
      newGalleryPaths.push(await uploadFileToCloud(f, virtualPath));
    }
    item.gallery = [...currentGallery, ...newGalleryPaths];

    // Bloques con imagen
    let blocks = data.blocks ? JSON.parse(data.blocks) : item.blocks;
    blocks = await Promise.all(blocks.map(async (block: any) => {
      if (block.type === 'image') {
        const file = files?.find(f => f.fieldname === `block_image_${block.id}`);
        if (file) {
          const url = await uploadFileToCloud(file, virtualPath);
          return { ...block, content: url };
        }
      }
      return block;
    }));
    item.blocks = blocks;
  } catch (err: any) {
    return res.status(502).json({ message: `Error al subir archivos a OM Cloud Storage: ${err?.message || err}` });
  }

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
  // const dir = path.join(process.cwd(), 'public', 'images', item.slug);
  // if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

  const io = req.app.get('io');
  if (io) io.emit('newsDeleted', { id });
  res.json({ message: 'Deleted successfully' });
});

export default router;