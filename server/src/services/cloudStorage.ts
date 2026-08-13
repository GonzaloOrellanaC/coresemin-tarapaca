import { STORAGE_CLOUD_API_URL, STORAGE_CLOUD_API_KEY } from '../config';

export interface CloudFile {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  virtualPath: string;
  isPublic: boolean;
  publicUrl: string;
}

/**
 * Sube un archivo (recibido en memoria por multer) a OM Cloud Storage.
 *
 * Endpoint (configurable vía STORAGE_CLOUD_API_URL):
 *   POST /api/v1/external/upload
 *   Headers: x-api-key: <STORAGE_CLOUD_API_KEY>
 *   Multipart: file, virtualPath, isPublic
 *
 * Devuelve el objeto `file` de la respuesta. Usa `file.publicUrl` para
 * guardar la URL en la base de datos.
 */
export async function uploadToCloudStorage(
  file: Express.Multer.File,
  virtualPath: string,
  isPublic = true
): Promise<CloudFile> {
  if (!STORAGE_CLOUD_API_KEY) {
    throw new Error('STORAGE_CLOUD_API_KEY no está configurada en el entorno');
  }

  const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
  const form = new FormData();
  form.append('file', blob, file.originalname);
  form.append('virtualPath', virtualPath.endsWith('/') ? virtualPath : virtualPath + '/');
  form.append('isPublic', isPublic ? 'true' : 'false');

  let res: Response;
  try {
    res = await fetch(STORAGE_CLOUD_API_URL, {
      method: 'POST',
      headers: { 'x-api-key': STORAGE_CLOUD_API_KEY },
      body: form,
    });
  } catch (err: any) {
    throw new Error(`No se pudo conectar con OM Cloud Storage: ${err?.message || err}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`OM Cloud Storage respondió HTTP ${res.status} con un cuerpo no JSON`);
  }

  if (!res.ok || data?.success !== true) {
    throw new Error(data?.message || `OM Cloud Storage respondió HTTP ${res.status}`);
  }

  const cloudFile = (data?.file || {}) as Record<string, any>;
  let publicUrl = data?.publicUrl || cloudFile?.publicUrl || '';

  // La web se sirve por https; normalizamos para evitar mixed content
  // (los navegadores bloquean recursos http dentro de páginas https).
  if (publicUrl) {
    publicUrl = publicUrl.replace(/^http:\/\//i, 'https://');
  }

  if (!publicUrl) {
    throw new Error('OM Cloud Storage no devolvió una URL pública para el archivo');
  }

  return {
    id: cloudFile.id || '',
    originalName: cloudFile.originalName || cloudFile.name || file.originalname,
    mimeType: cloudFile.mimeType || file.mimetype,
    sizeBytes: cloudFile.sizeBytes || 0,
    virtualPath: cloudFile.virtualPath || virtualPath,
    isPublic: typeof cloudFile.isPublic === 'boolean' ? cloudFile.isPublic : isPublic,
    publicUrl,
  };
}
