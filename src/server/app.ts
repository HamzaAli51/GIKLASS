import express from 'express';
import cookieParser from 'cookie-parser';
import { initDB } from '../lib/db.ts';
import authRoutes from './auth.ts';
import classRoutes from './classes.ts';
import messageRoutes from './messages.ts';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(async (_req, res, next) => {
	try {
		await initDB();
		next();
	} catch (error) {
		console.error('Database initialization error:', error);
		res.status(500).json({ error: 'Database initialization failed' });
	}
});
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/messages', messageRoutes);

export default app;