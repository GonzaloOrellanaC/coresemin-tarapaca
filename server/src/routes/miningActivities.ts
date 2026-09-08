import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { MiningActivity } from '../models/MiningActivity';
import { fetchLinkMetadata } from '../services/linkPreview';

const router = Router();

// 1. Obtener registros con paginación
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    // Si no se pide formato paginado estricto y se consulta como antes, mantener compatibilidad
    const total = await MiningActivity.countDocuments();
    const activities = await MiningActivity.find()
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Si viene el parámetro 'paginate=true', devolver objeto con metadatos
    if (req.query.paginate === 'true') {
      return res.json({
        items: activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      });
    }

    return res.json(activities);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error al obtener actividades mineras', error: err?.message });
  }
});

// Obtener por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await MiningActivity.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Actividad minera no encontrada' });
    return res.json(item);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error al obtener actividad minera', error: err?.message });
  }
});

// 2. Extraer metadatos de un link para vista previa en el panel de administración
router.post('/preview', authenticate, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'URL requerida' });
  }

  try {
    const preview = await fetchLinkMetadata(url);
    return res.json(preview);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error al procesar el enlace', error: err?.message });
  }
});

// 3. Crear una nueva publicación de Actividad Minera (revisada y enviada por admin)
router.post('/', authenticate, async (req, res) => {
  const { title, description, url, imageUrl, sourcePlatform, authorName, publishDate } = req.body;

  if (!title || !url) {
    return res.status(400).json({ message: 'Título y URL son obligatorios' });
  }

  try {
    const newActivity = await MiningActivity.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      url: url.trim(),
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : '/CORESEMIN-LOGO.png',
      sourcePlatform: sourcePlatform ? sourcePlatform.trim() : '',
      authorName: authorName ? authorName.trim() : '',
      publishDate: publishDate ? new Date(publishDate) : new Date()
    });

    const io = req.app.get('io');
    if (io) io.emit('miningActivityCreated', newActivity);

    return res.status(201).json(newActivity);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error al guardar actividad minera', error: err?.message });
  }
});

// 4. Editar una publicación de Actividad Minera existente
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, url, imageUrl, sourcePlatform, authorName, publishDate } = req.body;

  try {
    const item = await MiningActivity.findById(id);
    if (!item) return res.status(404).json({ message: 'Actividad minera no encontrada' });

    if (title !== undefined) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (url !== undefined) item.url = url.trim();
    if (imageUrl !== undefined) item.imageUrl = imageUrl.trim() || '/CORESEMIN-LOGO.png';
    if (sourcePlatform !== undefined) item.sourcePlatform = sourcePlatform.trim();
    if (authorName !== undefined) item.authorName = authorName.trim();
    if (publishDate !== undefined) item.publishDate = new Date(publishDate);

    await item.save();

    const io = req.app.get('io');
    if (io) io.emit('miningActivityUpdated', item);

    return res.json(item);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error al actualizar actividad minera', error: err?.message });
  }
});

// 5. Eliminar una publicación
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await MiningActivity.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Actividad minera no encontrada' });

    const io = req.app.get('io');
    if (io) io.emit('miningActivityDeleted', { id });

    return res.json({ message: 'Eliminado correctamente' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error al eliminar actividad minera', error: err?.message });
  }
});

export default router;
