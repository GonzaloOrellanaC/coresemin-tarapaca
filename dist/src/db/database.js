"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = void 0;
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
const file = path_1.default.resolve(__dirname, '..', '..', '..', 'db.json'); // ruta absoluta al JSON
console.log({ file });
const defaultData = { news: [] };
// Exportamos una función para obtener la instancia de la BBDD
const getDb = async () => {
    // Conecta y crea "db.json" si no existe
    return await (0, node_1.JSONFilePreset)(file, defaultData);
};
exports.getDb = getDb;
