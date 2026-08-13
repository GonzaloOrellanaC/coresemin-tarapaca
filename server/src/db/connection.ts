import mongoose from 'mongoose';
import dns from 'dns';
import { MONGO_URI } from '../config';

// Algunos routers locales rechazan consultas DNS SRV, que MongoDB necesita
// para URIs `mongodb+srv://`. Si FORCE_PUBLIC_DNS=true (útil en dev local),
// forzamos resolvers públicos que sí responden SRV.
if (process.env.FORCE_PUBLIC_DNS === 'true') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
