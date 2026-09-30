import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:giklass.db', // local file in dev
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = {
  prepare(sql: string) {
    return {
      get: async (...args: any[]) => {
        const r = await client.execute({ sql, args });
        return r.rows[0] ? ({ ...r.rows[0] } as any) : undefined;
      },
      all: async (...args: any[]) => {
        const r = await client.execute({ sql, args });
        return r.rows.map((row) => ({ ...row })) as any[];
      },
      run: async (...args: any[]) => {
        const r = await client.execute({ sql, args });
        return { changes: r.rowsAffected, lastInsertRowid: Number(r.lastInsertRowid ?? 0) };
      },
    };
  },
  exec: (sql: string) => client.executeMultiple(sql),
};

let ready: Promise<void> | null = null;

export function initDB() {
  ready ??= (async () => {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS student (
        student_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        roll_number VARCHAR(20) UNIQUE NOT NULL,
        programme VARCHAR(100) NOT NULL,
        year SMALLINT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS instructor (
        instructor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        department VARCHAR(100) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS class (
        class_id INTEGER PRIMARY KEY AUTOINCREMENT,
        instructor_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        title VARCHAR(150) NOT NULL,
        class_code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES instructor(instructor_id)
      );
      CREATE TABLE IF NOT EXISTS enrollment (
        enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        UNIQUE(student_id, class_id),
        FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS message (
        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        title VARCHAR(150),
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'announcement',
        due_date TIMESTAMP,
        attachments TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES user(user_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS comment (
        comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES message(message_id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES user(user_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS submission (
        submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        content TEXT,
        attachments TEXT,
        grade VARCHAR(20),
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        graded_at TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES message(message_id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES user(user_id) ON DELETE CASCADE,
        UNIQUE(message_id, student_id)
      );
    `);
  })();
  return ready;
}

export default db;
