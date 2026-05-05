import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../lib/db.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/signup', async (req, res) => {
  const name = req.body.name?.trim();
  const password = req.body.password?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const role = req.body.role;
  const details = req.body.details;

  try {
    const existingUser = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (role === 'student') {
      const existingRoll = db.prepare('SELECT student_id FROM student WHERE roll_number = ?').get(details.rollNumber);
      if (existingRoll) {
        return res.status(400).json({ error: 'Roll number already registered' });
      }
    }

    const info = db.transaction(() => {
      const userResult = db.prepare(
        'INSERT INTO user (name, email, password_hash) VALUES (?, ?, ?)'
      ).run(name, email, passwordHash);

      const userId = userResult.lastInsertRowid;

      if (role === 'student') {
        db.prepare(
          'INSERT INTO student (user_id, roll_number, programme, year) VALUES (?, ?, ?, ?)'
        ).run(userId, details.rollNumber, details.programme, details.year);
      } else if (role === 'instructor') {
        db.prepare(
          'INSERT INTO instructor (user_id, phone, address, department) VALUES (?, ?, ?, ?)'
        ).run(userId, details.phone, details.address, details.department);
      }

      return userId;
    })();

    const token = jwt.sign({ userId: info, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'User created successfully', role });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const password = req.body.password?.trim();
  const email = req.body.email?.trim().toLowerCase();

  try {
    const user: any = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if student or instructor
    const student = db.prepare('SELECT * FROM student WHERE user_id = ?').get(user.user_id);
    const instructor = db.prepare('SELECT * FROM instructor WHERE user_id = ?').get(user.user_id);
    const role = instructor ? 'instructor' : 'student';

    const token = jwt.sign({ userId: user.user_id, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Logged in successfully', role, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user: any = db.prepare('SELECT name, email FROM user WHERE user_id = ?').get(decoded.userId);
    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({ error: 'User not found' });
    }
    res.json({ ...user, role: decoded.role });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
