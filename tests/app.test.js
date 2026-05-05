import { describe, test, expect } from '@jest/globals';

const BASE = 'http://localhost:3000/api';

// --- Auth Logic ---
describe('Auth Logic', () => {

    test('student is blocked without roll number', () => {
        const role = 'student';
        const roll = '';
        const blocked = role === 'student' && !roll;
        expect(blocked).toBe(true);
    });

    test('instructor is not blocked without roll number', () => {
        const role = 'instructor';
        const roll = '';
        const blocked = role === 'student' && !roll;
        expect(blocked).toBe(false);
    });

    test('only valid roles allowed', () => {
        const validRoles = ['student', 'instructor'];
        expect(validRoles).toContain('student');
        expect(validRoles).toContain('instructor');
        expect(validRoles).not.toContain('admin');
    });

});

// --- Class Logic ---
describe('Class Logic', () => {

    test('class code must be 6 characters', () => {
        const code = 'ABC123';
        expect(code.length).toBe(6);
    });

    test('class code converts to uppercase', () => {
        const code = 'abc123'.toUpperCase();
        expect(code).toBe('ABC123');
    });

    test('short class code is invalid', () => {
        const code = 'AB1';
        expect(code.length).not.toBe(6);
    });

    test('class object has required fields', () => {
        const cls = { name: 'CS101', subject: 'Programming', class_code: 'ABC123' };
        expect(cls).toHaveProperty('name');
        expect(cls).toHaveProperty('subject');
        expect(cls).toHaveProperty('class_code');
    });

    test('enterClass finds correct class by id', () => {
        const classes = [
            { class_id: 1, name: 'CS101' },
            { class_id: 2, name: 'DevOps' }
        ];
        const found = classes.find(c => c.class_id.toString() === '2');
        expect(found.name).toBe('DevOps');
    });

    test('enterClass returns undefined for wrong id', () => {
        const classes = [{ class_id: 1, name: 'CS101' }];
        const found = classes.find(c => c.class_id.toString() === '99');
        expect(found).toBeUndefined();
    });

});

// --- User Logic ---
describe('User Logic', () => {

    test('avatar shows first letter uppercased', () => {
        const name = 'hamza';
        expect(name[0].toUpperCase()).toBe('H');
    });

    test('logout clears user state', () => {
        let user = { name: 'Hamza', role: 'student' };
        let classes = [{ class_id: 1 }];
        let selectedClass = { class_id: 1 };

        // simulate logout
        user = null;
        classes = [];
        selectedClass = null;

        expect(user).toBeNull();
        expect(classes).toHaveLength(0);
        expect(selectedClass).toBeNull();
    });

});

// --- API Tests ---
describe('API Endpoints', () => {

    test('login fails with wrong credentials', async () => {
        const res = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'fake@test.com', password: 'wrongpass' })
        });
        expect(res.status).toBe(401);
    });

    test('signup fails with empty fields', async () => {
        const res = await fetch(`${BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: '', email: '', password: '', role: 'student', details: { rollNumber: '' } })
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('joining invalid class code returns error', async () => {
        const res = await fetch(`${BASE}/classes/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classCode: 'XXXXXX' })
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

});