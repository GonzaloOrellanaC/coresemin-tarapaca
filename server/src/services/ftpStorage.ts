import * as ftp from 'basic-ftp';
import sharp from 'sharp';
import { Readable } from 'stream';

const FTP_HOST = process.env.FTP_SERVER || 'ftp.coresemintarapaca.cl';
const FTP_USER = process.env.FTP_USERNAME || 'node@imagenes.coresemintarapaca.cl';
const FTP_PASS = process.env.FTP_PASSWORD || 'omtec2026#';
const FTP_PORT = parseInt(process.env.FTP_PORT || '21', 10);
const HTTP_BASE = 'https://imagenes.coresemintarapaca.cl/node/news';

export interface UploadResult {
  originalUrl: string;
  thumbnailUrl: string;
}

export async function uploadImageAndThumbnail(
  fileBuffer: Buffer,
  slug: string,
  baseFileName: string
): Promise<UploadResult> {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASS,
      port: FTP_PORT,
      secure: false
    });

    const targetDir = `news/${safeSlug}`;
    await client.ensureDir(targetDir);

    // 1. Subir original
    const origName = `${baseFileName}.jpg`;
    const origStream = Readable.from(fileBuffer);
    await client.uploadFrom(origStream, origName);

    // 2. Generar versión thumbnail al 25% de sus dimensiones con Sharp
    const metadata = await sharp(fileBuffer).metadata();
    const origW = metadata.width || 800;
    const origH = metadata.height || 600;
    const targetW = Math.max(1, Math.round(origW * 0.25));
    const targetH = Math.max(1, Math.round(origH * 0.25));

    const thumbBuffer = await sharp(fileBuffer)
      .resize(targetW, targetH, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbName = `tn_${baseFileName}.jpg`;
    const thumbStream = Readable.from(thumbBuffer);
    await client.uploadFrom(thumbStream, thumbName);

    return {
      originalUrl: `${HTTP_BASE}/${safeSlug}/${origName}`,
      thumbnailUrl: `${HTTP_BASE}/${safeSlug}/${thumbName}`
    };
  } finally {
    client.close();
  }
}
