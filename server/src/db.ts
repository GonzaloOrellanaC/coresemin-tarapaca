import mongoose from 'mongoose';
import dns from 'dns';
import { MONGO_URI } from './config';

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    
    // Configura servidores DNS externos (Google y Cloudflare) antes de reintentar
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    console.log('Reintentando resolución con DNS externos...');

    try {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected via custom DNS');
    } catch (retryErr) {
      console.error('MongoDB connection error after custom DNS', retryErr);
      process.exit(1);
    }
  }
}