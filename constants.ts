import { SocialLinks } from './types';

export const CORE_COLOR = '#028938';
export const LOGO_URL = '/public/CORESEMIN-LOGO.png';

export const SOCIAL_LINKS: SocialLinks = {
  twitter: 'https://x.com/CoreseminTarap',
  facebook: 'https://www.facebook.com/CoreseminTarapaca/',
  instagram: 'https://www.instagram.com/coresemin_tarapaca/',
  linkedin: 'https://www.linkedin.com/in/coresemin-tarapac%C3%A1-010560294/',
};

export const INITIAL_NEWS_DATA = [
  {
    id: '1',
    slug: 'lanzamiento-campana-seguridad-2024',
    title: 'Lanzamiento Campaña de Seguridad 2024',
    subtitle: 'Coresemin Tarapacá inicia actividades anuales con enfoque en prevención.',
    coverImage: 'https://picsum.photos/seed/safety/800/400',
    author: 'Admin',
    publishDate: new Date().toISOString(),
    category: 'Noticia',
    blocks: [
      { id: 'b1', type: 'text', content: 'Con gran asistencia de las empresas socias, se dio inicio a la campaña anual.' },
      { id: 'b2', type: 'image', content: 'https://picsum.photos/seed/meeting/800/400', styles: { width: 'full' } },
      { id: 'b3', type: 'text', content: 'El objetivo es reducir la accidentabilidad en un 20% respecto al año anterior mediante talleres prácticos.' }
    ]
  },
  {
    id: '2',
    slug: 'seminario-innovacion-minera',
    title: 'Seminario de Innovación en Minería',
    subtitle: 'Expertos internacionales visitan Iquique.',
    coverImage: 'https://picsum.photos/seed/mining/800/400',
    author: 'Admin',
    publishDate: new Date(Date.now() - 86400000).toISOString(),
    category: 'Capacitación',
    blocks: [
      { id: 'b1', type: 'text', content: 'La tecnología autónoma fue el centro de la discusión en el último seminario.' }
    ]
  }
];