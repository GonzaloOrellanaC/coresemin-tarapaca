"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const slugify_1 = require("../utils/slugify");
const database_1 = require("../db/database");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const title = req.body.title || 'temp';
        const slug = (0, slugify_1.slugify)(title);
        // Path relative to server/src/routes/news.ts: ../../../app/public/images/slug
        const dir = path_1.default.join(process.cwd(), 'public', 'images', slug);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Preserve original extension but could normalize name
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${(0, slugify_1.slugify)(name)}${ext}`);
    }
});
const upload = (0, multer_1.default)({ storage });
const uploadFields = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'gallery', maxCount: 30 }
]);
// List all news
router.get('/', async (req, res) => {
    const db = await (0, database_1.getDb)();
    console.log(db);
    const list = [...db.data.news].sort((a, b) => {
        const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
        const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
        return dateB - dateA; // descending
    });
    res.json(list);
});
// Get by slug
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    const db = await (0, database_1.getDb)();
    const item = db.data.news.find(n => n.slug === slug);
    if (!item)
        return res.status(404).json({ message: 'Not found' });
    res.json(item);
});
// Create news (protected)
router.post('/', auth_1.authenticate, upload.any(), async (req, res) => {
    const data = req.body;
    const files = req.files;
    if (!data.title || !data.category)
        return res.status(400).json({ message: 'title and category required' });
    const slug = (0, slugify_1.slugify)(data.title);
    const db = await (0, database_1.getDb)();
    const exists = db.data.news.find((n) => n.slug === slug);
    if (exists)
        return res.status(409).json({ message: 'slug already exists' });
    const coverImageFile = files?.find(f => f.fieldname === 'coverImage');
    const galleryFiles = files?.filter(f => f.fieldname === 'gallery') || [];
    let blocks = data.blocks ? JSON.parse(data.blocks) : [];
    // Process block images
    blocks = blocks.map((block) => {
        if (block.type === 'image') {
            const file = files?.find(f => f.fieldname === `block_image_${block.id}`);
            if (file) {
                return { ...block, content: `/public/images/${slug}/${file.filename}` };
            }
        }
        return block;
    });
    const doc = {
        id: Date.now().toString(),
        slug,
        title: data.title,
        subtitle: data.subtitle,
        coverImage: coverImageFile ? `/public/images/${slug}/${coverImageFile.filename}` : data.coverImage,
        gallery: galleryFiles.map(f => `/public/images/${slug}/${f.filename}`),
        author: data.author || 'Admin',
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString() : new Date().toISOString(),
        category: data.category,
        blocks
    };
    db.data.news.push(doc);
    await db.write();
    // emit via socket.io if available
    const io = req.app.get('io');
    if (io)
        io.emit('newsCreated', doc);
    res.status(201).json(doc);
});
// Update news (protected)
router.put('/:id', auth_1.authenticate, upload.any(), async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const files = req.files;
    if (!id || id === 'undefined') {
        return res.status(400).json({ message: 'Invalid ID provided' });
    }
    const db = await (0, database_1.getDb)();
    const index = db.data.news.findIndex(n => n.id === id);
    if (index === -1)
        return res.status(404).json({ message: 'Not found' });
    const item = db.data.news[index];
    const slug = data.title ? (0, slugify_1.slugify)(data.title) : item.slug;
    item.title = data.title || item.title;
    item.subtitle = data.subtitle !== undefined ? data.subtitle : item.subtitle;
    item.category = data.category || item.category;
    item.publishDate = data.publishDate ? new Date(data.publishDate).toISOString() : item.publishDate;
    let blocks = data.blocks ? JSON.parse(data.blocks) : item.blocks;
    // Process block images
    blocks = blocks.map((block) => {
        if (block.type === 'image') {
            const file = files?.find(f => f.fieldname === `block_image_${block.id}`);
            if (file) {
                return { ...block, content: `/public/images/${slug}/${file.filename}` };
            }
        }
        return block;
    });
    item.blocks = blocks;
    const coverImageFile = files?.find(f => f.fieldname === 'coverImage');
    const galleryFiles = files?.filter(f => f.fieldname === 'gallery') || [];
    if (coverImageFile) {
        item.coverImage = `/public/images/${slug}/${coverImageFile.filename}`;
    }
    else if (data.coverImageUrl) {
        item.coverImage = data.coverImageUrl;
    }
    // Handle gallery: if existingGallery is provided, use it as baseline
    let currentGallery = data.existingGallery ? JSON.parse(data.existingGallery) : (item.gallery || []);
    const newGalleryPaths = galleryFiles.map(f => `/public/images/${slug}/${f.filename}`);
    item.gallery = [...currentGallery, ...newGalleryPaths];
    item.slug = slug;
    await db.write();
    const io = req.app.get('io');
    if (io)
        io.emit('newsUpdated', item);
    res.json(item);
});
// Delete news (protected)
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    const { id } = req.params;
    const db = await (0, database_1.getDb)();
    const index = db.data.news.findIndex(n => n.id === id);
    if (index === -1)
        return res.status(404).json({ message: 'Not found' });
    db.data.news.splice(index, 1);
    await db.write();
    // Optional: Delete images folder
    // const dir = path.join(process.cwd(), 'public', 'images', item.slug);
    // if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    const io = req.app.get('io');
    if (io)
        io.emit('newsDeleted', { id });
    res.json({ message: 'Deleted successfully' });
});
exports.default = router;
