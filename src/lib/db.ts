import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('giklass.db');

export function initDB() {
  // 1. Create the Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Student table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student (
      student_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL UNIQUE,
      roll_number   VARCHAR(20) UNIQUE NOT NULL,
      programme     VARCHAR(100) NOT NULL,
      year          SMALLINT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
    );
  `);

  // 3. Instructor table
  db.exec(`
    CREATE TABLE IF NOT EXISTS instructor (
      instructor_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL UNIQUE,
      phone         VARCHAR(20),
      address       TEXT,
      department    VARCHAR(100) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
    );
  `);

  // 4. Class table
  db.exec(`
    CREATE TABLE IF NOT EXISTS class (
      class_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      instructor_id INTEGER NOT NULL,
      name          VARCHAR(100) NOT NULL,
      subject       VARCHAR(100) NOT NULL,
      title         VARCHAR(150) NOT NULL,
      class_code    VARCHAR(10),
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES instructor(instructor_id)
    );
  `);

  // Ensure class_code column exists (migration for existing DBs)
  const tableInfo = db.prepare("PRAGMA table_info(class)").all() as any[];
  const hasClassCode = tableInfo.some(column => column.name === 'class_code');
  
  if (!hasClassCode) {
    try {
      db.exec('ALTER TABLE class ADD COLUMN class_code VARCHAR(10)');
      // Not using UNIQUE in ALTER TABLE as it can be problematic in some SQLite versions without a default
    } catch (e: any) {
      console.error('Migration failed for class_code:', e.message);
    }
  }

  // 5. Enrollment table
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollment (
      enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id    INTEGER NOT NULL,
      class_id      INTEGER NOT NULL,
      enrolled_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status        VARCHAR(20) DEFAULT 'active',
      UNIQUE(student_id, class_id),
      FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE
    );
  `);

  // 6. Message table (used for Class Stream announcements)
  db.exec(`
    CREATE TABLE IF NOT EXISTS message (
      message_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id      INTEGER NOT NULL,
      sender_id     INTEGER NOT NULL,
      title         VARCHAR(150),
      content       TEXT NOT NULL,
      type          VARCHAR(20) DEFAULT 'announcement', -- 'announcement' or 'assignment'
      due_date      TIMESTAMP,
      sent_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES user(user_id) ON DELETE CASCADE
    );
  `);

  // Ensure message table columns exist (migration for existing DBs)
  const messageTableInfo = db.prepare("PRAGMA table_info(message)").all() as any[];
  const hasTitle = messageTableInfo.some(column => column.name === 'title');
  const hasType = messageTableInfo.some(column => column.name === 'type');
  const hasDueDate = messageTableInfo.some(column => column.name === 'due_date');
  const hasAttachments = messageTableInfo.some(column => column.name === 'attachments');
  
  if (!hasTitle) db.exec('ALTER TABLE message ADD COLUMN title VARCHAR(150)');
  if (!hasType) db.exec("ALTER TABLE message ADD COLUMN type VARCHAR(20) DEFAULT 'announcement'");
  if (!hasDueDate) db.exec('ALTER TABLE message ADD COLUMN due_date TIMESTAMP');
  if (!hasAttachments) db.exec('ALTER TABLE message ADD COLUMN attachments TEXT'); // JSON string for metadata

  // 7. Comment table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comment (
      comment_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id    INTEGER NOT NULL,
      sender_id     INTEGER NOT NULL,
      content       TEXT NOT NULL,
      sent_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES message(message_id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES user(user_id) ON DELETE CASCADE
    );
  `);

  // 8. Submission table
  db.exec(`
    CREATE TABLE IF NOT EXISTS submission (
      submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id    INTEGER NOT NULL,
      student_id    INTEGER NOT NULL,
      content       TEXT,
      attachments   TEXT, -- JSON string
      grade         VARCHAR(20),
      feedback      TEXT,
      submitted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      graded_at     TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES message(message_id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES user(user_id) ON DELETE CASCADE,
      UNIQUE(message_id, student_id)
    );
  `);
}

export default db;
