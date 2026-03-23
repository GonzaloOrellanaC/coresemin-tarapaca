import mongoose, { Schema, Document } from 'mongoose';

export interface Block {
  id: string;
  type: 'text' | 'image';
  content: string;
  styles?: Record<string, any>;
}

export interface NewsDoc extends Document {
  slug: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  author?: string;
  publishDate: Date;
  category: 'Noticia' | 'Capacitación' | 'Evento' | string;
  blocks: Block[];
  gallery?: string[];
  dateEvent?: Date;
}

const BlockSchema = new Schema<Block>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  styles: { type: Schema.Types.Mixed }
});

const NewsSchema = new Schema<NewsDoc>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  coverImage: { type: String },
  author: { type: String },
  publishDate: { type: Date, default: Date.now },
  category: { type: String, required: true },
  blocks: { type: [BlockSchema], default: [] },
  gallery: { type: [String], default: [] },
  dateEvent: { type: Date }
});

export const News = mongoose.model<NewsDoc>('News', NewsSchema);
