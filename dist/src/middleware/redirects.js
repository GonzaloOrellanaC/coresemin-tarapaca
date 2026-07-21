"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = redirects;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let mapping = {};
try {
    const p = path_1.default.join(process.cwd(), 'server', 'redirects.json');
    if (fs_1.default.existsSync(p)) {
        mapping = JSON.parse(fs_1.default.readFileSync(p, 'utf8'));
    }
}
catch (err) {
    console.warn('Failed to load redirects.json', err);
}
function redirects(req, res, next) {
    const full = req.protocol + '://' + req.get('host') + req.originalUrl;
    const pathOnly = req.originalUrl;
    if (mapping[full])
        return res.redirect(301, mapping[full]);
    if (mapping[pathOnly])
        return res.redirect(301, mapping[pathOnly]);
    // also try with and without trailing slash
    if (!pathOnly.endsWith('/') && mapping[pathOnly + '/'])
        return res.redirect(301, mapping[pathOnly + '/']);
    if (pathOnly.endsWith('/') && mapping[pathOnly.slice(0, -1)])
        return res.redirect(301, mapping[pathOnly.slice(0, -1)]);
    next();
}
