import mongoose from 'mongoose';

export const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();

  return res.status(503).json({
    message: 'Database is not connected. Please fix the MongoDB Atlas username/password in Railway MONGO_URI, then redeploy.',
    database: globalThis.__TEAM_TASK_MANAGER_DB_STATUS__ || 'disconnected'
  });
};
