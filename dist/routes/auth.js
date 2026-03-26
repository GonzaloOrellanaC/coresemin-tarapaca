"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin123';
    if (username === adminUser && password === adminPass) {
        const signOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') };
        const token = jsonwebtoken_1.default.sign({ username }, config_1.JWT_SECRET, signOptions);
        return res.json({ token });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});
exports.default = router;
