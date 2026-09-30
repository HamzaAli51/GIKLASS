import express from 'express';
import app from './src/server/app.ts';

const server = express();
server.use(app);

export default server;
