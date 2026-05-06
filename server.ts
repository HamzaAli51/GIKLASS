import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { initDB } from './src/lib/db.ts';
import authRoutes from './src/server/auth.ts';
import classRoutes from './src/server/classes.ts';
import messageRoutes from './src/server/messages.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  initDB();

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/messages', messageRoutes);

  // --- REVISED ENVIRONMENT LOGIC ---
  if (process.env.NODE_ENV !== 'production') {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    /**
     * PRODUCTION MODE
     * Serves the single-file index.html for all non-API routes.
     * Use __dirname to ensure the path is absolute within the container.
     */
    const indexPath = path.join(__dirname, 'index.html');
    
    // Serve any additional static assets if they exist in the root
    app.use(express.static(__dirname));

    // Fallback for Single Page Application (SPA) routing
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  }

  // Bind to 0.0.0.0 to ensure visibility outside the Docker container [cite: 47, 76]
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (Production: ${process.env.NODE_ENV === 'production'})`);
  });
}

startServer();