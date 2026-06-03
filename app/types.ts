export interface SocialLinks {
  twitter: string;
  facebook: string;
  instagram: string;
  linkedin: string;
}

export type BlockType = 'text' | 'image' | 'heading' | 'link';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // Text content, Image URL, or Link URL
  linkName?: string; // For 'link' block
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
  coverImage: string | File;
  author: string;
  publishDate: string; // ISO string
  blocks: ContentBlock[];
  gallery?: (string | File)[];
  category: 'Noticia' | 'Evento' | 'Capacitación' | 'Blog';
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'Seminario' | 'Reunión' | 'Capacitación';
  image: string;
  dateEvent: string; // ISO string for event date
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}