import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.disable('etag');

const clientDist = path.resolve(__dirname, '../../frontend/dist');
const clientIndex = path.join(clientDist, 'index.html');
const shouldServeClient = process.env.NODE_ENV === 'production' || fs.existsSync(clientIndex);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
   'https://project-task-manager-production-757e.up.railway.app'
].filter(Boolean);

const allowAllCorsOrigins = process.env.CLIENT_URL === '*';

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
    ? {
        directives: {
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https://images.unsplash.com']
        }
      }
    : false
}));
app.use(cors({
  origin(origin, callback) {
    if (allowAllCorsOrigins) return callback(null, true);
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'team-task-manager',
    database: globalThis.__TEAM_TASK_MANAGER_DB_STATUS__ || 'unknown'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

if (shouldServeClient && fs.existsSync(clientIndex)) {
  const assetsDir = path.join(clientDist, 'assets');
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });
  app.use('/assets', express.static(assetsDir, {
    etag: false,
    fallthrough: false,
    immutable: false,
    maxAge: 0,
    setHeaders(res) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));
  app.use(express.static(clientDist, {
    etag: false,
    maxAge: 0,
    setHeaders(res) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(clientIndex);
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'team-task-manager',
      message: 'API is running. Build the frontend to serve the app from this URL.',
      health: '/api/health'
    });
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
