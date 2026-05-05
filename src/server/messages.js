import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../lib/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

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

// Get stream for a specific class
router.get('/:classId', authenticate, (req, res) => {
  const { classId } = req.params;
  try {
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name
      FROM message m
      JOIN user u ON m.sender_id = u.user_id
      WHERE m.class_id = ?
      ORDER BY m.sent_at DESC
    `).all(classId);

    const messagesWithComments = messages.map((m) => {
      const comments = db.prepare(`
        SELECT c.*, u.name as sender_name
        FROM comment c
        JOIN user u ON c.sender_id = u.user_id
        WHERE c.message_id = ?
        ORDER BY c.sent_at ASC
      `).all(m.message_id);
      return { ...m, comments };
    });

    res.json(messagesWithComments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stream' });
  }
});

// Post a message (Announcement/Assignment)
router.post('/:classId', authenticate, (req, res) => {
  const { classId } = req.params;
  const { content, title, type, dueDate, attachments } = req.body;
  const { userId, role } = req.user;

  if (role !== 'instructor' && type === 'assignment') {
    return res.status(403).json({ error: 'Only instructors can post assignments' });
  }

  try {
    db.prepare(`
      INSERT INTO message (class_id, sender_id, content, title, type, due_date, attachments)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(classId, userId, content, title, type || 'announcement', dueDate, JSON.stringify(attachments || []));

    res.json({ message: 'Posted successfully' });
  } catch (error) {
    console.error('Post error:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// Add a comment
router.post('/comment/:messageId', authenticate, (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const { userId } = req.user;

  try {
    db.prepare(`
      INSERT INTO comment (message_id, sender_id, content)
      VALUES (?, ?, ?)
    `).run(messageId, userId, content);

    res.json({ message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Submit an assignment
router.post('/submit/:messageId', authenticate, (req, res) => {
  const { messageId } = req.params;
  const { content, attachments } = req.body;
  const { userId, role } = req.user;

  if (role !== 'student') return res.status(403).json({ error: 'Only students can submit work' });

  try {
    db.prepare(`
      INSERT INTO submission (message_id, student_id, content, attachments)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(message_id, student_id) DO UPDATE SET
        content = excluded.content,
        attachments = excluded.attachments,
        submitted_at = CURRENT_TIMESTAMP
    `).run(messageId, userId, content, JSON.stringify(attachments || []));

    res.json({ message: 'Work submitted successfully' });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit work' });
  }
});

// Get submissions for an assignment (Instructor only, or Student can see their own)
router.get('/submissions/:messageId', authenticate, (req, res) => {
  const { messageId } = req.params;
  const { userId, role } = req.user;

  try {
    if (role === 'instructor') {
      const submissions = db.prepare(`
        SELECT s.*, u.name as student_name
        FROM submission s
        JOIN user u ON s.student_id = u.user_id
        WHERE s.message_id = ?
        ORDER BY s.submitted_at DESC
      `).all(messageId);
      res.json(submissions);
    } else {
      const submission = db.prepare(`
        SELECT * FROM submission WHERE message_id = ? AND student_id = ?
      `).get(messageId, userId);
      res.json(submission ? [submission] : []);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Grade a submission
router.post('/grade/:submissionId', authenticate, (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;
  const { role } = req.user;

  if (role !== 'instructor') return res.status(403).json({ error: 'Only instructors can grade' });

  try {
    db.prepare(`
      UPDATE submission 
      SET grade = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP
      WHERE submission_id = ?
    `).run(grade, feedback, submissionId);

    res.json({ message: 'Grade saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save grade' });
  }
});

// Get all assignments across all classes for the user
router.get('/all-assignments', authenticate, (req, res) => {
  const { userId, role } = req.user;

  try {
    let assignments;
    if (role === 'student') {
      assignments = db.prepare(`
        SELECT m.*, u.name as sender_name, c.name as class_name
        FROM message m
        JOIN user u ON m.sender_id = u.user_id
        JOIN class c ON m.class_id = c.class_id
        JOIN enrollment e ON c.class_id = e.class_id
        JOIN student s ON e.student_id = s.student_id
        WHERE s.user_id = ? AND m.type = 'assignment'
        ORDER BY m.due_date ASC
      `).all(userId);
    } else {
      assignments = db.prepare(`
        SELECT m.*, u.name as sender_name, c.name as class_name
        FROM message m
        JOIN user u ON m.sender_id = u.user_id
        JOIN class c ON m.class_id = c.class_id
        JOIN instructor i ON c.instructor_id = i.instructor_id
        WHERE i.user_id = ? AND m.type = 'assignment'
        ORDER BY m.due_date ASC
      `).all(userId);
    }
    res.json(assignments);
  } catch (error) {
    console.error('All assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch global assignments' });
  }
});

export default router;
