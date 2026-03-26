"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const News_1 = require("../models/News");
const auth_1 = require("../middleware/auth");
const slugify_1 = require("../utils/slugify");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// List all news
router.get('/', async (req, res) => {
    const list = await News_1.News.find().sort({ publishDate: -1 }).lean();
    res.json(list);
});
// Get by slug
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    const item = await News_1.News.findOne({ slug }).lean();
    if (!item)
        return res.status(404).json({ message: 'Not found' });
    res.json(item);
});
// Create news (protected)
router.post('/', auth_1.authenticate, upload.single('cover'), async (req, res) => {
    const data = req.body;
    if (!data.title || !data.category)
        return res.status(400).json({ message: 'title and category required' });
    const slug = (0, slugify_1.slugify)(data.title);
    const exists = await News_1.News.findOne({ slug });
    if (exists)
        return res.status(409).json({ message: 'slug already exists' });
    const doc = new News_1.News({
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
    if (io)
        io.emit('newsCreated', doc);
    res.status(201).json(doc);
});
exports.default = router;
