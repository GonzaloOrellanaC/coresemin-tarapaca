import { JSONFilePreset } from 'lowdb/node';
import path from 'path';

const file = path.resolve(__dirname, '..', '..', '..', 'db.json'); // ruta absoluta al JSON

console.log({file})

// Interfaz que define un artículo de noticia/evento
export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  author?: string;
  publishDate?: string;
  category?: string;
  blocks?: any[];
  gallery?: string[];
  dateEvent?: string;
}

// Estructura principal de la BBDD
interface DbSchema {
  news: NewsItem[];
}

const defaultData: DbSchema = { news: [] };

// Exportamos una función para obtener la instancia de la BBDD
export const getDb = async () => {
  // Conecta y crea "db.json" si no existe
  return await JSONFilePreset(file, defaultData);
};
