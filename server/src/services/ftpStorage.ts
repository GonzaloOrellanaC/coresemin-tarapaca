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

export async function uploadMultipleImagesAndThumbnails(
  items: { buffer: Buffer; baseFileName: string }[],
  slug: string,
  onItemProgress?: (index: number, total: number, fileName: string) => void
): Promise<UploadResult[]> {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const client = new ftp.Client(60000);
  client.ftp.verbose = false;

  const results: UploadResult[] = [];

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

    for (let i = 0; i < items.length; i++) {
      const { buffer, baseFileName } = items[i];
      if (onItemProgress) {
        onItemProgress(i + 1, items.length, baseFileName);
      }

      // 1. Subir original
      const origName = `${baseFileName}.jpg`;
      const origStream = Readable.from(buffer);
      await client.uploadFrom(origStream, origName);

      // 2. Generar versión thumbnail al 25% de sus dimensiones con Sharp
      const metadata = await sharp(buffer).metadata();
      const origW = metadata.width || 800;
      const origH = metadata.height || 600;
      const targetW = Math.max(1, Math.round(origW * 0.25));
      const targetH = Math.max(1, Math.round(origH * 0.25));

      const thumbBuffer = await sharp(buffer)
        .resize(targetW, targetH, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbName = `tn_${baseFileName}.jpg`;
      const thumbStream = Readable.from(thumbBuffer);
      await client.uploadFrom(thumbStream, thumbName);

      results.push({
        originalUrl: `${HTTP_BASE}/${safeSlug}/${origName}`,
        thumbnailUrl: `${HTTP_BASE}/${safeSlug}/${thumbName}`
      });
    }

    return results;
  } finally {
    client.close();
  }
}

export async function uploadImageAndThumbnail(
  fileBuffer: Buffer,
  slug: string,
  baseFileName: string
): Promise<UploadResult> {
  const [res] = await uploadMultipleImagesAndThumbnails([{ buffer: fileBuffer, baseFileName }], slug);
  return res;
}

export async function deleteNewsFtpDirectory(slug: string): Promise<void> {
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
    // removeDir elimina el directorio de forma recursiva con todos sus archivos
    await client.removeDir(targetDir);
  } catch (err) {
    console.warn(`[FTP] Advertencia al eliminar directorio ${safeSlug}:`, err);
  } finally {
    client.close();
  }
}
