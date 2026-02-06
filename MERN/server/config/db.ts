import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI

  try {
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables')
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
