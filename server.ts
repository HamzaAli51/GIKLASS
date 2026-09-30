import express from 'express';
import path from 'node:path';
import app from './src/server/app.ts';

const server = express();
server.get('/', (_req, res) => {
	res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});
server.use(app);

export default server;
