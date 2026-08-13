/**
 * Migración de datos: db.json (lowdb) -> MongoDB (Mongoose)
 *
 * Uso:
 *   node scripts/migrate-dbjson-to-mongo.cjs
 *
 * - Lee MONGO_URI del archivo .env de la raíz del proyecto (dotenv).
 * - Conecta a MongoDB y hace un UPSERT por `slug`, por lo que es idempotente
 *   (re-ejecutarlo no duplica noticias).
 * - Usa el mismo esquema que server/src/models/News.ts.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Algunos routers locales rechazan consultas DNS SRV, que el driver de MongoDB
// necesita para las URIs `mongodb+srv://`. Forzamos un resolver público que sí
// las responde (p.ej. Google/Cloudflare).
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Por defecto usa db_v2.json (archivo correcto actual). Se puede indicar otro
// archivo con: node scripts/migrate-dbjson-to-mongo.cjs <archivo.json>
const DB_FILE = process.argv[2]
  ? path.join(__dirname, '..', process.argv[2])
  : path.join(__dirname, '..', 'db_v2.json');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/coresemin';

async function main() {
  if (!fs.existsSync(DB_FILE)) {
    console.error('No se encontró el archivo de base de datos en', DB_FILE);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const items = raw.news || [];
  console.log('Registros a migrar:', items.length);

  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB:', MONGO_URI.replace(/\/\/.*@/, '//***@'));

  // Mismo esquema que server/src/models/News.ts
  const BlockSchema = new mongoose.Schema({
    id: String,
    type: String,
    content: String,
    linkName: String,
    styles: mongoose.Schema.Types.Mixed,
  });

  const NewsSchema = new mongoose.Schema(
    {
      slug: { type: String, required: true, unique: true },
      title: { type: String, required: true },
      subtitle: String,
      coverImage: String,
      author: String,
      publishDate: { type: Date, default: Date.now },
      category: { type: String, required: true },
      blocks: { type: [BlockSchema], default: [] },
      gallery: { type: [String], default: [] },
      dateEvent: Date,
    },
    { timestamps: true, toJSON: { virtuals: true } }
  );

  const News = mongoose.models.News || mongoose.model('News', NewsSchema);

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const item of items) {
    if (!item.slug || !item.title) {
      console.warn('Omitido (sin slug o título):', JSON.stringify(item).slice(0, 80));
      unchanged++;
      continue;
    }

    const doc = {
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle || '',
      coverImage: item.coverImage || '',
      author: item.author || 'Coresemin',
      publishDate: item.publishDate ? new Date(item.publishDate) : new Date(),
      category: item.category || 'Noticia',
      blocks: item.blocks || [],
      gallery: item.gallery || [],
      dateEvent: item.dateEvent ? new Date(item.dateEvent) : undefined,
    };

    const result = await News.updateOne({ slug: item.slug }, { $set: doc }, { upsert: true });

    if (result.upsertedCount > 0) inserted++;
    else if (result.modifiedCount > 0) updated++;
    else unchanged++;
  }

  console.log(
    `Migración completa: ${inserted} insertados, ${updated} actualizados, ${unchanged} sin cambios/omitidos`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error en la migración:', err);
  process.exit(1);
});
