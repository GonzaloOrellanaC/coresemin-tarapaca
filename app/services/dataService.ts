import axios from 'axios';
import { Article, EventItem, MiningActivityItem, PaginatedMiningActivities } from '../types';

const API_BASE = import.meta.env.VITE_SERVER_URL;

console.log('API base URL:', API_BASE);

const api = axios.create({ baseURL: API_BASE });

export const getArticles = async (): Promise<Article[]> => {
  const res = await api.get('/news');
  return res.data || [];
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    const res = await api.get(`/news/${slug}`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const saveArticle = async (article: Article, token?: string, blockFiles?: {[key: string]: File}): Promise<Article> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const form = new FormData();
  form.append('title', article.title);
  form.append('subtitle', article.subtitle || '');
  form.append('category', article.category);
  form.append('author', article.author || 'Admin');
  form.append('publishDate', article.publishDate || new Date().toISOString());
  form.append('blocks', JSON.stringify(article.blocks || []));
  if (article.coverImage) form.append('coverImage', article.coverImage);

  if (article.gallery && Array.isArray(article.gallery)) {
    article.gallery.forEach(item => {
      if (item instanceof File) form.append('gallery', item);
    });
  }

  if (blockFiles) {
    Object.entries(blockFiles).forEach(([id, file]) => {
      form.append(`block_image_${id}`, file);
    });
  }

  const res = await api.post('/news', form, { headers });
  return res.data;
};

export const updateArticle = async (id: string, article: Article, token?: string, blockFiles?: {[key: string]: File}): Promise<Article> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const form = new FormData();
  form.append('title', article.title);
  form.append('subtitle', article.subtitle || '');
  form.append('category', article.category);
  form.append('author', article.author || 'Admin');
  form.append('publishDate', article.publishDate || new Date().toISOString());
  form.append('blocks', JSON.stringify(article.blocks || []));
  if (article.coverImage instanceof File) {
    form.append('coverImage', article.coverImage);
  } else if (typeof article.coverImage === 'string') {
    form.append('coverImageUrl', article.coverImage);
  }
  
  const existingGallery: string[] = [];
  if (article.gallery && Array.isArray(article.gallery)) {
    article.gallery.forEach(item => {
      if (item instanceof File) {
        form.append('gallery', item);
      } else {
        existingGallery.push(item as string);
      }
    });
  }
  form.append('existingGallery', JSON.stringify(existingGallery));

  if (blockFiles) {
    Object.entries(blockFiles).forEach(([bid, file]) => {
      form.append(`block_image_${bid}`, file);
    });
  }

  const res = await api.put(`/news/${id}`, form, { headers });
  return res.data;
};

export const deleteArticle = async (id: string, token?: string): Promise<void> => {
  await api.delete(`/news/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
};

export const login = async (username: string, password: string): Promise<string> => {
  const res = await api.post('/auth/login', { username, password });
  return res.data.token;
};

export const getEvents = async (): Promise<EventItem[]> => {
  // events are stored as news with category 'Evento' or 'Capacitación'
  const all = await getArticles();
  return (all.filter(a => a.category === 'Evento' || a.category === 'Capacitación') as unknown) as EventItem[];
};

export const getMiningActivities = async (limit: number = 20): Promise<MiningActivityItem[]> => {
  const res = await api.get(`/mining-activities?limit=${limit}`);
  return res.data || [];
};

export const getPaginatedMiningActivities = async (page: number = 1, limit: number = 10): Promise<PaginatedMiningActivities> => {
  const res = await api.get(`/mining-activities?page=${page}&limit=${limit}&paginate=true`);
  return res.data;
};

export const getMiningActivityById = async (id: string): Promise<MiningActivityItem | null> => {
  try {
    const res = await api.get(`/mining-activities/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const previewMiningActivityLink = async (url: string, token?: string): Promise<MiningActivityItem> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await api.post('/mining-activities/preview', { url }, { headers });
  return res.data;
};

export const createMiningActivity = async (item: Partial<MiningActivityItem>, token?: string): Promise<MiningActivityItem> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await api.post('/mining-activities', item, { headers });
  return res.data;
};

export const updateMiningActivity = async (id: string, item: Partial<MiningActivityItem>, token?: string): Promise<MiningActivityItem> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await api.put(`/mining-activities/${id}`, item, { headers });
  return res.data;
};

export const deleteMiningActivity = async (id: string, token?: string): Promise<void> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  await api.delete(`/mining-activities/${id}`, { headers });
};