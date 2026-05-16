import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    globalThis.__TEAM_TASK_MANAGER_DB_STATUS__ = 'missing MONGO_URI';
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(mongoUri.trim(), {
    dbName: process.env.DB_NAME?.trim() || undefined
  });
  globalThis.__TEAM_TASK_MANAGER_DB_STATUS__ = 'connected';
  console.log(`MongoDB connected: ${connection.connection.host}`);
};

export default connectDB;
