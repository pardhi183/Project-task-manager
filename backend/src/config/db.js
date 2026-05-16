import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(mongoUri, {
    dbName: process.env.DB_NAME || undefined
  });
  console.log(`MongoDB connected: ${connection.connection.host}`);
};

export default connectDB;
