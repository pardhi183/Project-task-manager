import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Team Task Manager API running on port ${PORT}`);
  });

  try {
    await connectDB();
  } catch (error) {
    globalThis.__TEAM_TASK_MANAGER_DB_STATUS__ = error.message;
    console.error('Database connection failed:', error.message);
  }
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
