"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const config_1 = require("./config");
async function connectDB() {
    try {
        await mongoose_1.default.connect(config_1.MONGO_URI);
        console.log('MongoDB connected');
    }
    catch (err) {
        console.error('MongoDB connection error', err);
        // Configura servidores DNS externos (Google y Cloudflare) antes de reintentar
        dns_1.default.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
        console.log('Reintentando resolución con DNS externos...');
        try {
            await mongoose_1.default.connect(config_1.MONGO_URI);
            console.log('MongoDB connected via custom DNS');
        }
        catch (retryErr) {
            console.error('MongoDB connection error after custom DNS', retryErr);
            process.exit(1);
        }
    }
}
