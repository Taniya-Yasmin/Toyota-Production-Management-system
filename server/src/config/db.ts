import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB(): Promise<void> {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pmsp';
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected successfully to ${uri}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}
