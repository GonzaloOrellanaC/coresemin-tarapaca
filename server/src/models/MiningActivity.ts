import mongoose, { Schema, Document } from 'mongoose';

export interface MiningActivityDoc extends Document {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  sourcePlatform?: string;
  authorName?: string;
  publishDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MiningActivitySchema = new Schema<MiningActivityDoc>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  sourcePlatform: { type: String, default: '' },
  authorName: { type: String, default: '' },
  publishDate: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

export const MiningActivity = mongoose.model<MiningActivityDoc>('MiningActivity', MiningActivitySchema);
