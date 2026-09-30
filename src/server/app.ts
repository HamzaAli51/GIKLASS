import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './auth.ts';
import classRoutes from './classes.ts';
import messageRoutes from './messages.ts';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/messages', messageRoutes);

export default app;