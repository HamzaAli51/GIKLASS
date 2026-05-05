import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { initDB } from './src/lib/db.js';
import authRoutes from './src/server/auth.js';
import classRoutes from './src/server/classes.js';
import messageRoutes from './src/server/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  initDB();

  app.use(express.json());
  app.use(cookieParser());

  // Static files middleware
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/messages', messageRoutes);

  // Fallback for SPA-like behavior in Vanilla (optional)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
