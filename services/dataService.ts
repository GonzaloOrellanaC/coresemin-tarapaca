import axios from 'axios';
import { Article, EventItem } from '../types';

const API_BASE = import.meta.env.VITE_SERVER_URL;

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

export const saveArticle = async (article: Article, token?: string): Promise<Article> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const form = new FormData();
  form.append('title', article.title);
  form.append('subtitle', article.subtitle || '');
  form.append('category', article.category);
  form.append('author', article.author || 'Admin');
  form.append('publishDate', article.publishDate || new Date().toISOString());
  form.append('blocks', JSON.stringify(article.blocks || []));
  if (article.coverImage) form.append('coverImage', article.coverImage);

  const res = await api.post('/news', form, { headers });
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