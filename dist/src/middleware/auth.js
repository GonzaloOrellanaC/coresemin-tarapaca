"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function authenticate(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ message: 'No token' });
    const parts = auth.split(' ');
    if (parts.length !== 2)
        return res.status(401).json({ message: 'Invalid token format' });
    const token = parts[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
