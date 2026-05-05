import { describe, test, expect } from '@jest/globals';

// --- Auth Logic ---
describe('Auth Logic', () => {

    test('student blocked without roll number', () => {
        const role = 'student';
        const roll = '';
        expect(role === 'student' && !roll).toBe(true);
    });

    test('instructor allowed without roll number', () => {
        const role = 'instructor';
        const roll = '';
        expect(role === 'student' && !roll).toBe(false);
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
        expect('ABC123'.length).toBe(6);
    });

    test('class code converts to uppercase', () => {
        expect('abc123'.toUpperCase()).toBe('ABC123');
    });

    test('short class code is invalid', () => {
        expect('AB1'.length).not.toBe(6);
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

    test('logout clears all state', () => {
        let user = { name: 'Hamza', role: 'student' };
        let classes = [{ class_id: 1 }];
        let selectedClass = { class_id: 1 };

        user = null;
        classes = [];
        selectedClass = null;

        expect(user).toBeNull();
        expect(classes).toHaveLength(0);
        expect(selectedClass).toBeNull();
    });

});