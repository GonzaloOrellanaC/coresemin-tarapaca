export interface SocialLinks {
  twitter: string;
  facebook: string;
  instagram: string;
  linkedin: string;
}

export type BlockType = 'text' | 'image' | 'heading';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // Text content or Image URL
  styles?: {
    bold?: boolean;
    align?: 'left' | 'center' | 'right';
    width?: 'full' | 'half'; // For images
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  author: string;
  publishDate: string; // ISO string
  blocks: ContentBlock[];
  category: 'Noticia' | 'Evento' | 'Capacitación';
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'Seminario' | 'Reunión' | 'Capacitación';
  image: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}