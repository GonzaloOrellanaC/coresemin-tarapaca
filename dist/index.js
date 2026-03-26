"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const db_1 = require("./db");
const news_1 = __importDefault(require("./routes/news"));
const auth_1 = __importDefault(require("./routes/auth"));
const sitemap_1 = __importDefault(require("./routes/sitemap"));
const robots_1 = __importDefault(require("./routes/robots"));
const redirects_1 = __importDefault(require("./middleware/redirects"));
const Server = () => {
    const app = (0, express_1.default)();
    // Configure helmet with a Content Security Policy that allows the
    // specific inline script hash and trusted script/style sources.
    app.use((0, helmet_1.default)({
        // Disable COEP so external CDNs (Tailwind CDN) are not blocked by embedder policies
        crossOriginEmbedderPolicy: false,
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
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin))
                return callback(null, true);
            return callback(new Error('CORS policy: origin not allowed'));
        },
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
    // Serve public images folder (all subfolders and files) as static.
    // Use __dirname so path works when server process cwd is the server folder.
    const imagesDir = path_1.default.join(__dirname, '..', 'app', 'public', 'images');
    if (!fs_1.default.existsSync(imagesDir)) {
        console.warn('Warning: images directory not found at', imagesDir);
    }
    else {
        console.log('Serving images from', imagesDir);
    }
    app.use('/images', (0, cors_1.default)({ origin: 'https://coresemintarapaca.cl', credentials: true }), express_1.default.static(imagesDir));
    // Redirects from old WordPress URLs
    app.use(redirects_1.default);
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
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
    app.use('/api/news', news_1.default);
    app.use('/api/auth', auth_1.default);
    app.use('/', sitemap_1.default);
    app.use('/', robots_1.default);
    // Serve frontend in production (assumes Vite build output in /dist)
    if (process.env.NODE_ENV === 'production') {
        const staticPath = path_1.default.join(process.cwd(), 'app', 'dist');
        console.log('Serving static files from', staticPath);
        app.use(express_1.default.static(staticPath));
        // Only serve index.html for navigation requests (HTML) — avoid returning index.html
        // for requests to asset files (css/js) which would cause wrong MIME types.
        app.get('*', (req, res, next) => {
            console.log('Received request for', req.path, 'with Accept header:', req.headers.accept);
            const accept = req.headers.accept || '';
            if (req.method !== 'GET')
                return next();
            // If the request looks like it accepts HTML, return index.html
            if (accept.includes('text/html')) {
                return res.sendFile(path_1.default.join(staticPath, 'index.html'));
            }
            return next();
        });
    }
    async function start() {
        if (process.env.SERVER_MODE === 'server') {
            await (0, db_1.connectDB)();
        }
        server.listen(config_1.PORT, () => {
            console.log(`Server running on http://localhost:${config_1.PORT}`);
        });
    }
    start().catch((err) => console.error(err));
};
exports.default = Server;
