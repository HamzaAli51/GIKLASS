import express from 'express';
import path from 'node:path';
import app from './src/server/app.ts';

const publicPath = path.join(process.cwd(), 'public');
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.static(publicPath));
app.use((_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});