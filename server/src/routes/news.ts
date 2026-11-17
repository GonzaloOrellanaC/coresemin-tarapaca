import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { slugify } from '../utils/slugify';
import { News } from '../models/News';
import { uploadImageAndThumbnail, uploadMultipleImagesAndThumbnails, deleteNewsFtpDirectory } from '../services/ftpStorage';

const router = Router();

// Los archivos se cargan en memoria y se suben al hosting FTP
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 } // 40MB por archivo
});

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
  const files = (req.files as Express.Multer.File[]) || [];
  const io = req.app.get('io');
  const uploadSessionId = req.headers['x-upload-session-id'] as string;

  const emitProgress = (status: string, percent: number, currentImage?: string) => {
    if (io) {
      const payload = { uploadSessionId, status, percent, currentImage };
      io.emit('newsUploadProgress', payload);
      if (uploadSessionId) {
        io.to(uploadSessionId).emit('newsUploadProgress', payload);
      }
    }
  };

  if (!data.title || !data.category) return res.status(400).json({ message: 'title and category required' });
  const slug = slugify(data.title);

  const exists = await News.findOne({ slug });
  if (exists) return res.status(409).json({ message: 'slug already exists' });

  const coverImageFile = files.find(f => f.fieldname === 'coverImage');
  const galleryFiles = files.filter(f => f.fieldname === 'gallery');

  try {
    emitProgress('Iniciando procesamiento de archivos...', 5);

    // Preparar lista unificada de archivos a subir
    const uploadTasks: { buffer: Buffer; baseFileName: string; originalname: string; type: 'cover' | 'gallery' | 'block'; blockId?: string }[] = [];

    if (coverImageFile) {
      uploadTasks.push({
        buffer: coverImageFile.buffer,
        baseFileName: 'cover',
        originalname: coverImageFile.originalname,
        type: 'cover'
      });
    }

    galleryFiles.forEach((f, idx) => {
      uploadTasks.push({
        buffer: f.buffer,
        baseFileName: `gallery_${idx + 1}`,
        originalname: f.originalname,
        type: 'gallery'
      });
    });

    let blocks = data.blocks ? JSON.parse(data.blocks) : [];
    blocks.forEach((block: any, bIdx: number) => {
      if (block.type === 'image') {
        const file = files.find(f => f.fieldname === `block_image_${block.id}`);
        if (file) {
          uploadTasks.push({
            buffer: file.buffer,
            baseFileName: `block_${bIdx + 1}`,
            originalname: file.originalname,
            type: 'block',
            blockId: block.id
          });
        }
      }
    });

    let coverImage = data.coverImage || '';
    const gallery: string[] = [];
    const blockImgMap: Record<string, string> = {};

    if (uploadTasks.length > 0) {
      const results = await uploadMultipleImagesAndThumbnails(
        uploadTasks.map(t => ({ buffer: t.buffer, baseFileName: t.baseFileName })),
        slug,
        (current, total, baseFileName) => {
          const task = uploadTasks[current - 1];
          const pct = 10 + Math.round((current / total) * 75);
          emitProgress(`Procesando (${current}/${total}): ${task.originalname}...`, pct, task.originalname);
        }
      );

      // Asignar URLs resultantes
      uploadTasks.forEach((t, i) => {
        const res = results[i];
        if (t.type === 'cover') {
          coverImage = res.thumbnailUrl;
        } else if (t.type === 'gallery') {
          gallery.push(res.thumbnailUrl);
        } else if (t.type === 'block' && t.blockId) {
          blockImgMap[t.blockId] = res.thumbnailUrl;
        }
      });
    }

    // Actualizar bloques con las nuevas URLs
    blocks = blocks.map((block: any) => {
      if (block.type === 'image' && blockImgMap[block.id]) {
        return { ...block, content: blockImgMap[block.id] };
      }
      return block;
    });

    emitProgress('Guardando noticia en base de datos...', 90);

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

    emitProgress('¡Noticia publicada con éxito!', 100);

    if (io) io.emit('newsCreated', created);
    return res.status(201).json(created);
  } catch (err: any) {
    emitProgress(`Error: ${err?.message || err}`, 0);
    return res.status(502).json({ message: `Error al subir imágenes al hosting FTP: ${err?.message || err}` });
  }
});

// Update news (protected)
router.put('/:id', authenticate, upload.any(), async (req, res) => {
  const { id } = req.params;
  const data = req.body as any;
  const files = (req.files as Express.Multer.File[]) || [];
  const io = req.app.get('io');
  const uploadSessionId = req.headers['x-upload-session-id'] as string;

  const emitProgress = (status: string, percent: number, currentImage?: string) => {
    if (io) {
      const payload = { uploadSessionId, status, percent, currentImage };
      io.emit('newsUploadProgress', payload);
      if (uploadSessionId) {
        io.to(uploadSessionId).emit('newsUploadProgress', payload);
      }
    }
  };

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

  const coverImageFile = files.find(f => f.fieldname === 'coverImage');
  const galleryFiles = files.filter(f => f.fieldname === 'gallery');

  try {
    emitProgress('Procesando cambios...', 10);

    const uploadTasks: { buffer: Buffer; baseFileName: string; originalname: string; type: 'cover' | 'gallery' | 'block'; blockId?: string }[] = [];

    // Portada: si viene un archivo nuevo se sube al storage FTP
    if (coverImageFile) {
      uploadTasks.push({
        buffer: coverImageFile.buffer,
        baseFileName: 'cover',
        originalname: coverImageFile.originalname,
        type: 'cover'
      });
    } else if (data.coverImageUrl) {
      item.coverImage = data.coverImageUrl;
    }

    // Galería: conserva las existentes y sube las nuevas al hosting
    let currentGallery = data.existingGallery ? JSON.parse(data.existingGallery) : (item.gallery || []);
    let gIdx = currentGallery.length;
    galleryFiles.forEach((f) => {
      gIdx++;
      uploadTasks.push({
        buffer: f.buffer,
        baseFileName: `gallery_${gIdx}`,
        originalname: f.originalname,
        type: 'gallery'
      });
    });

    // Bloques con imagen
    let blocks = data.blocks ? JSON.parse(data.blocks) : item.blocks;
    blocks.forEach((block: any, bIdx: number) => {
      if (block.type === 'image') {
        const file = files.find(f => f.fieldname === `block_image_${block.id}`);
        if (file) {
          uploadTasks.push({
            buffer: file.buffer,
            baseFileName: `block_${bIdx + 1}`,
            originalname: file.originalname,
            type: 'block',
            blockId: block.id
          });
        }
      }
    });

    if (uploadTasks.length > 0) {
      const results = await uploadMultipleImagesAndThumbnails(
        uploadTasks.map(t => ({ buffer: t.buffer, baseFileName: t.baseFileName })),
        slug,
        (current, total, baseFileName) => {
          const task = uploadTasks[current - 1];
          const pct = 15 + Math.round((current / total) * 75);
          emitProgress(`Procesando (${current}/${total}): ${task.originalname}...`, pct, task.originalname);
        }
      );

      const newGalleryPaths: string[] = [];
      const blockImgMap: Record<string, string> = {};

      uploadTasks.forEach((t, i) => {
        const res = results[i];
        if (t.type === 'cover') {
          item.coverImage = res.thumbnailUrl;
        } else if (t.type === 'gallery') {
          newGalleryPaths.push(res.thumbnailUrl);
        } else if (t.type === 'block' && t.blockId) {
          blockImgMap[t.blockId] = res.thumbnailUrl;
        }
      });

      if (newGalleryPaths.length > 0) {
        item.gallery = [...currentGallery, ...newGalleryPaths];
      }

      blocks = blocks.map((block: any) => {
        if (block.type === 'image' && blockImgMap[block.id]) {
          return { ...block, content: blockImgMap[block.id] };
        }
        return block;
      });
    }

    item.blocks = blocks;
  } catch (err: any) {
    emitProgress(`Error: ${err?.message || err}`, 0);
    return res.status(502).json({ message: `Error al subir imágenes al hosting FTP: ${err?.message || err}` });
  }

  item.slug = slug;
  await item.save();

  emitProgress('¡Noticia actualizada exitosamente!', 100);

  if (io) io.emit('newsUpdated', item);
  return res.json(item);
});

// Delete news (protected)
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  const item = await News.findByIdAndDelete(id);
  if (!item) return res.status(404).json({ message: 'Not found' });

  // Eliminar carpeta de fotos en el servidor FTP
  if (item.slug) {
    await deleteNewsFtpDirectory(item.slug);
  }

  const io = req.app.get('io');
  if (io) io.emit('newsDeleted', { id });
  res.json({ message: 'Deleted successfully' });
});

export default router;
