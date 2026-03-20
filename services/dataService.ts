import { Article, EventItem } from '../types';
import { INITIAL_NEWS_DATA } from '../constants';

const NEWS_KEY = 'coresemin_news';
const EVENTS_KEY = 'coresemin_events';

// Initialize data if empty
const initData = () => {
  if (!localStorage.getItem(NEWS_KEY)) {
    localStorage.setItem(NEWS_KEY, JSON.stringify(INITIAL_NEWS_DATA));
  }
  if (!localStorage.getItem(EVENTS_KEY)) {
    const events: EventItem[] = [
      {
        id: 'e1',
        title: 'Reunión Mensual de Socios',
        date: new Date(Date.now() + 86400000 * 5).toISOString(),
        location: 'Hotel Hilton Iquique',
        description: 'Revisión de KPIs mensuales de seguridad y planificación estratégica anual.',
        type: 'Reunión',
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 'e2',
        title: 'Capacitación Altura Física',
        date: new Date(Date.now() + 86400000 * 12).toISOString(),
        location: 'Centro Tecnológico Minero',
        description: 'Certificación técnica avanzada para trabajos en altura y rescate vertical.',
        type: 'Capacitación',
        image: 'https://images.unsplash.com/photo-1581094794329-cd6753354321?q=80&w=800&auto=format&fit=crop'
      }
    ];
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
};

export const getArticles = (): Article[] => {
  initData();
  const data = localStorage.getItem(NEWS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  const articles = getArticles();
  return articles.find(a => a.slug === slug);
};

export const saveArticle = (article: Article): void => {
  const articles = getArticles();
  const index = articles.findIndex(a => a.id === article.id);
  
  if (index >= 0) {
    articles[index] = article;
  } else {
    articles.unshift(article); // Add to top
  }
  
  localStorage.setItem(NEWS_KEY, JSON.stringify(articles));
};

export const deleteArticle = (id: string): void => {
    const articles = getArticles();
    const newArticles = articles.filter(a => a.id !== id);
    localStorage.setItem(NEWS_KEY, JSON.stringify(newArticles));
}

export const getEvents = (): EventItem[] => {
  initData();
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
};