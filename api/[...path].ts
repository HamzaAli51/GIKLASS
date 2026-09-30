import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/server/app.ts';
import { initDB } from '../src/lib/db.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initDB();
    const requestUrl = req.url ?? '/';
    if (!requestUrl.startsWith('/api')) {
      req.url = `/api${requestUrl.startsWith('/') ? requestUrl : `/${requestUrl}`}`;
    }
    return app(req, res);
  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({ error: 'Database initialization failed' });
  }
}