import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../lib/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware to protect routes
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate random class code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Get user classes
router.get('/', authenticate, (req, res) => {
  const { userId, role } = req.user;

  try {
    let classes;
    if (role === 'instructor') {
      const instructor = db.prepare('SELECT instructor_id FROM instructor WHERE user_id = ?').get(userId);
      if (!instructor) return res.status(404).json({ error: 'Instructor profile not found' });
      
      classes = db.prepare(`
        SELECT c.*, (SELECT COUNT(*) FROM enrollment e WHERE e.class_id = c.class_id) as student_count
        FROM class c 
        WHERE c.instructor_id = ?
      `).all(instructor.instructor_id);
    } else {
      const student = db.prepare('SELECT student_id FROM student WHERE user_id = ?').get(userId);
      if (!student) return res.status(404).json({ error: 'Student profile not found' });

      classes = db.prepare(`
        SELECT c.*, u.name as instructor_name
        FROM class c
        JOIN enrollment e ON c.class_id = e.class_id
        JOIN instructor i ON c.instructor_id = i.instructor_id
        JOIN user u ON i.user_id = u.user_id
        WHERE e.student_id = ?
      `).all(student.student_id);
    }
    res.json(classes || []);
  } catch (error) {
    console.error('Fetch classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Create Class (Instructor only)
router.post('/create', authenticate, (req, res) => {
  if (req.user.role !== 'instructor') return res.status(403).json({ error: 'Only instructors can create classes' });
  
  const { name, subject, title } = req.body;
  if (!name || !subject) return res.status(400).json({ error: 'Name and Subject are required' });
  
  const { userId } = req.user;

  try {
    const instructor = db.prepare('SELECT instructor_id FROM instructor WHERE user_id = ?').get(userId);
    if (!instructor) return res.status(404).json({ error: 'Instructor profile not found' });

    const classCode = generateCode();

    const result = db.prepare(
      'INSERT INTO class (instructor_id, name, subject, title, class_code) VALUES (?, ?, ?, ?, ?)'
    ).run(instructor.instructor_id, name, subject, title || name, classCode);

    res.json({ message: 'Class created', classId: result.lastInsertRowid, classCode });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: error.message || 'Failed to create class' });
  }
});

// Join Class (Student only)
router.post('/join', authenticate, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can join classes' });
  
  const { classCode } = req.body;
  if (!classCode) return res.status(400).json({ error: 'Class code is required' });
  
  const { userId } = req.user;

  try {
    const cls = db.prepare('SELECT class_id FROM class WHERE class_code = ?').get(classCode.trim().toUpperCase());
    if (!cls) return res.status(404).json({ error: 'Invalid class code' });

    const student = db.prepare('SELECT student_id FROM student WHERE user_id = ?').get(userId);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });
    
    db.prepare(
      'INSERT INTO enrollment (student_id, class_id) VALUES (?, ?)'
    ).run(student.student_id, cls.class_id);

    res.json({ message: 'Successfully joined class' });
  } catch (error) {
    console.error('Join class error:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'You are already enrolled in this class' });
    }
    res.status(500).json({ error: error.message || 'Failed to join class' });
  }
});

// Get class people (Instructor and Students)
router.get('/people/:classId', authenticate, (req, res) => {
  const { classId } = req.params;

  try {
    // 1. Get Instructor
    const instructor = db.prepare(`
      SELECT u.name, u.email, 'instructor' as role
      FROM class c
      JOIN instructor i ON c.instructor_id = i.instructor_id
      JOIN user u ON i.user_id = u.user_id
      WHERE c.class_id = ?
    `).get(classId);

    // 2. Get Students
    const students = db.prepare(`
      SELECT u.name, u.email, 'student' as role
      FROM enrollment e
      JOIN student s ON e.student_id = s.student_id
      JOIN user u ON s.user_id = u.user_id
      WHERE e.class_id = ?
      ORDER BY u.name ASC
    `).all(classId);

    res.json({ instructor, students });
  } catch (error) {
    console.error('Fetch people error:', error);
    res.status(500).json({ error: 'Failed to fetch people' });
  }
});

export default router;
