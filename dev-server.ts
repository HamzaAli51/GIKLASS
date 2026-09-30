import { createServer as createViteServer } from 'vite';
import app from './src/server/app.ts';

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

app.use(vite.middlewares);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});