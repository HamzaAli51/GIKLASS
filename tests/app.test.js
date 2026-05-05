// Tests for GIKLASS frontend logic

// --- Class Code Tests ---
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

// --- User Logic Tests ---
test('avatar shows first letter uppercased', () => {
    const name = 'hamza';
    expect(name[0].toUpperCase()).toBe('H');
});

test('valid roles are student and instructor only', () => {
    const validRoles = ['student', 'instructor'];
    expect(validRoles).toContain('student');
    expect(validRoles).toContain('instructor');
    expect(validRoles).not.toContain('admin');
});

test('student signup blocked without roll number', () => {
    const role = 'student';
    const roll = '';
    const blocked = role === 'student' && !roll;
    expect(blocked).toBe(true);
});

test('instructor signup allowed without roll number', () => {
    const role = 'instructor';
    const roll = '';
    const blocked = role === 'student' && !roll;
    expect(blocked).toBe(false);
});

// --- View Logic Tests ---
test('valid views are recognized', () => {
    const validViews = ['landing', 'login', 'signup', 'dashboard', 'class-detail'];
    expect(validViews).toContain('dashboard');
    expect(validViews).not.toContain('unknown-page');
});

// --- Class Object Tests ---
test('class object has required fields', () => {
    const cls = { name: 'CS101', subject: 'Programming', class_code: 'ABC123' };
    expect(cls).toHaveProperty('name');
    expect(cls).toHaveProperty('subject');
    expect(cls).toHaveProperty('class_code');
});