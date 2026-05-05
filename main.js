// GIKLASS Vanilla Frontend
const API_BASE = '/api';

// State
let user = null;
let currentView = 'landing';
let classes = [];
let selectedClass = null;

// Elements
const app = document.getElementById('app');
const modalOverlay = document.getElementById('modal-container');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

// --- Core Logic ---

async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`);
        if (res.ok) {
            const data = await res.json();
            user = { name: data.name, role: data.role };
            setView('dashboard');
        } else {
            setView('landing');
        }
    } catch (e) {
        console.warn('Auth check failed:', e);
        setView('landing');
    }
}

function setView(view) {
    currentView = view;
    render();
}

function render() {
    if (currentView === 'landing') renderLanding();
    else if (currentView === 'login') renderLogin();
    else if (currentView === 'signup') renderSignup();
    else if (currentView === 'dashboard') renderDashboard();
    else if (currentView === 'class-detail') renderClassDetail();
    else renderLanding(); // fallback
}

// --- Views ---

function renderLanding() {
    app.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card">
                <h1 class="auth-logo">GIKLASS</h1>
                <div class="auth-header">
                    <h2>Simplified learning.</h2>
                    <p>Experience the next generation workspace for modern education.</p>
                </div>
                <button class="btn btn-primary" onclick="window.setView('login')">Open GIKLASS</button>
                <div style="text-align:center; margin-top: 12px;">
                    <button class="btn-ghost" onclick="window.setView('signup')">New here? Create an account</button>
                </div>
            </div>
        </div>
    `;
}

function renderLogin() {
    app.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card" style="text-align: left;">
                <h1 class="auth-logo" style="display:block; text-align:center; cursor:pointer" onclick="window.setView('landing')">GIKLASS</h1>
                <div class="auth-header" style="text-align:center">
                    <h2>Welcome back</h2>
                    <p>Enter your details to sign in</p>
                </div>
                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label">Email address</label>
                        <input type="email" id="login-email" required placeholder="name@email.com" autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="login-password" required placeholder="••••••••" autocomplete="current-password">
                    </div>
                    <div id="login-error" style="color: red; font-size: 13px; margin-bottom: 8px; display:none;"></div>
                    <button type="submit" class="btn btn-primary">Sign in</button>
                </form>
                <div style="text-align:center">
                    <button class="btn-ghost" onclick="window.setView('signup')">New here? Create an account</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('login-form').onsubmit = handleLogin;
}

function renderSignup() {
    app.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card" style="text-align: left;">
                <h1 class="auth-logo" style="display:block; text-align:center; cursor:pointer" onclick="window.setView('landing')">GIKLASS</h1>
                <div class="auth-header" style="text-align:center">
                    <h2>Create account</h2>
                    <p>Join the future of education</p>
                </div>
                <form id="signup-form">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="signup-name" required placeholder="John Doe" autocomplete="name">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email address</label>
                        <input type="email" id="signup-email" required placeholder="name@email.com" autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="signup-password" required placeholder="••••••••" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label class="form-label">I am joining as a...</label>
                        <select id="signup-role">
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                    <div id="student-only" class="form-group">
                        <label class="form-label">Roll Number / ID</label>
                        <input type="text" id="signup-roll" placeholder="e.g. 2024CS001">
                    </div>
                    <div id="signup-error" style="color: red; font-size: 13px; margin-bottom: 8px; display:none;"></div>
                    <button type="submit" class="btn btn-primary">Create account</button>
                </form>
                <div style="text-align:center">
                    <button class="btn-ghost" onclick="window.setView('login')">Already have an account? Sign in</button>
                </div>
            </div>
        </div>
    `;

    const roleSelect = document.getElementById('signup-role');
    const studentOnly = document.getElementById('student-only');
    roleSelect.onchange = () => {
        studentOnly.style.display = roleSelect.value === 'student' ? 'block' : 'none';
    };

    document.getElementById('signup-form').onsubmit = handleSignup;
}

function renderDashboard() {
    app.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-brand"><h1 class="auth-logo" style="font-size: 24px; margin: 0;">GIKLASS</h1></div>
                <nav>
                    <ul class="nav-list">
                        <li class="nav-item"><button class="nav-link active" onclick="window.setView('dashboard')">Classes</button></li>
                    </ul>
                </nav>
                <div class="sidebar-footer">
                    <button class="nav-link" onclick="window.handleLogout()" style="width: 100%; border: 1px solid var(--border)">Sign out</button>
                </div>
            </aside>
            <main class="main-content">
                <div class="top-bar">
                    <h2 style="font-size: 20px;">My Classes</h2>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="badge badge-role">${user.role}</span>
                        <div class="avatar" title="${user.name}">${user.name.charAt(0).toUpperCase()}</div>
                    </div>
                </div>
                <div class="page-container">
                    <div class="page-header">
                        <div>
                            <h3 style="font-size: 16px; color: var(--text-muted); font-weight: 500;">ACTIVE CLASSES</h3>
                        </div>
                        <button class="btn btn-accent" style="width: auto;" onclick="window.showActionModal()">
                            ${user.role === 'instructor' ? '+ Create Class' : '+ Join Class'}
                        </button>
                    </div>
                    <div id="classes-list" class="grid">
                        <div class="loader"></div>
                    </div>
                </div>
            </main>
        </div>
    `;
    loadClasses();
}

function renderClassDetail() {
    if (!selectedClass) {
        setView('dashboard');
        return;
    }

    app.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-brand"><h1 class="auth-logo" style="font-size: 24px; margin: 0; cursor:pointer" onclick="window.setView('dashboard')">GIKLASS</h1></div>
                <nav>
                    <ul class="nav-list">
                        <li class="nav-item"><button class="nav-link active">Stream</button></li>
                        <li class="nav-item"><button class="nav-link" onclick="alert('Coming soon!')">People</button></li>
                    </ul>
                </nav>
                <div class="sidebar-footer">
                    <button class="nav-link" onclick="window.setView('dashboard')">← Back to Classes</button>
                </div>
            </aside>
            <main class="main-content">
                <div class="top-bar">
                    <div style="display:flex; align-items:center; gap: 16px;">
                         <button onclick="window.setView('dashboard')" style="font-size: 14px; color: var(--text-muted)" aria-label="Go back">←</button>
                         <h2 style="font-size: 20px;">${selectedClass.name}</h2>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="badge badge-role" style="background:#e0f2fe; color:#0369a1">CODE: ${selectedClass.class_code}</span>
                    </div>
                </div>
                <div class="page-container">
                    <div style="max-width: 800px; margin: 0 auto;">
                        <div class="card" style="margin-bottom: 24px; padding: 32px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white;">
                             <h1 style="color: white; font-size: 32px; margin-bottom: 8px;">${selectedClass.name}</h1>
                             <p style="opacity: 0.8; font-size: 16px;">${selectedClass.subject}</p>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div class="card" style="padding: 16px; border-style: dashed; text-align: center; color: var(--text-muted);">
                                 <p>📢 Stream features (announcements, messaging) coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

// --- API Handlers ---

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const data = await res.json();
            user = { name: data.user.name, role: data.role };
            setView('dashboard');
        } else {
            const data = await res.json();
            errorEl.textContent = data.error || 'Login failed. Please try again.';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        errorEl.textContent = 'Could not reach the server. Try again.';
        errorEl.style.display = 'block';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    const rollout = document.getElementById('signup-roll').value;
    const errorEl = document.getElementById('signup-error');

    if (role === 'student' && !rollout) {
        errorEl.textContent = 'Roll number is required for students.';
        errorEl.style.display = 'block';
        return;
    }

    const details = { rollNumber: rollout };

    try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, details })
        });

        if (res.ok) {
            const data = await res.json();
            user = { name, role: data.role };
            setView('dashboard');
        } else {
            const data = await res.json();
            errorEl.textContent = data.error || 'Signup failed. Please try again.';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        errorEl.textContent = 'Could not reach the server. Try again.';
        errorEl.style.display = 'block';
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {
        console.warn('Logout request failed:', e);
    } finally {
        user = null;
        classes = [];
        selectedClass = null;
        setView('landing');
    }
}

async function loadClasses() {
    const list = document.getElementById('classes-list');
    if (!list) return;

    try {
        const res = await fetch(`${API_BASE}/classes`);
        classes = await res.json();

        if (classes.length === 0) {
            list.innerHTML = `
                <div style="grid-column: 1/-1; padding: 48px; text-align: center; background: var(--bg-subtle); border-radius: var(--radius-lg); border: 2px dashed var(--border);">
                    <p style="color: var(--text-muted); font-size: 16px;">No classes yet. Start by ${user.role === 'instructor' ? 'creating' : 'joining'} one!</p>
                </div>
            `;
            return;
        }

        list.innerHTML = classes.map(cls => `
            <div class="card" onclick="window.enterClass('${cls.class_id}')" style="cursor:pointer" role="button" tabindex="0">
                <h3 class="card-title">${cls.name}</h3>
                <p class="card-subtitle">${cls.subject || 'All subjects'}</p>
                <div class="card-footer">
                    <span style="font-size: 12px; font-weight: 600; color: var(--accent)">CODE: ${cls.class_code}</span>
                    <span style="font-size: 12px; color: var(--text-muted)">${user.role === 'instructor' ? (cls.student_count + ' Students') : cls.instructor_name}</span>
                </div>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align:center;">Error loading classes. Please refresh.</p>';
    }
}

function enterClass(id) {
    selectedClass = classes.find(c => c.class_id.toString() === id.toString());
    if (selectedClass) {
        setView('class-detail');
    }
}

// --- Modals ---

function showActionModal() {
    modalOverlay.classList.add('active');
    if (user.role === 'instructor') {
        modalBody.innerHTML = `
            <div class="auth-header">
                <h2>Create New Class</h2>
                <p>Set up a workspace for your students</p>
            </div>
            <form id="create-class-form">
                <div class="form-group">
                    <label class="form-label">Class Name</label>
                    <input type="text" id="class-name" required placeholder="e.g. Computer Science 101">
                </div>
                <div class="form-group">
                    <label class="form-label">Subject</label>
                    <input type="text" id="class-subject" required placeholder="e.g. Programming">
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top: 12px;">Create class</button>
            </form>
        `;
        document.getElementById('create-class-form').onsubmit = handleCreateClass;
    } else {
        modalBody.innerHTML = `
            <div class="auth-header">
                <h2>Join a Class</h2>
                <p>Enter the 6-character code provided by your instructor</p>
            </div>
            <form id="join-class-form">
                <div class="form-group">
                    <label class="form-label">Class Code</label>
                    <input type="text" id="class-code" required placeholder="ABCDEF" maxlength="6" style="text-transform: uppercase;" autocomplete="off">
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top: 12px;">Join class</button>
            </form>
        `;
        document.getElementById('join-class-form').onsubmit = handleJoinClass;
    }
}

async function handleCreateClass(e) {
    e.preventDefault();
    const name = document.getElementById('class-name').value;
    const subject = document.getElementById('class-subject').value;

    try {
        const res = await fetch(`${API_BASE}/classes/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, subject })
        });

        if (res.ok) {
            modalOverlay.classList.remove('active');
            loadClasses();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to create class');
        }
    } catch (err) {
        alert('Server communication failed');
    }
}

async function handleJoinClass(e) {
    e.preventDefault();
    const classCode = document.getElementById('class-code').value.toUpperCase();

    try {
        const res = await fetch(`${API_BASE}/classes/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classCode })
        });

        if (res.ok) {
            modalOverlay.classList.remove('active');
            loadClasses();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to join class');
        }
    } catch (err) {
        alert('Server communication failed');
    }
}

// Close Modal
closeModalBtn.onclick = () => modalOverlay.classList.remove('active');
window.onclick = (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); };

// Export to window for onclick handlers
window.setView = setView;
window.handleLogout = handleLogout;
window.loadClasses = loadClasses;
window.showActionModal = showActionModal;
window.enterClass = enterClass;

// Bootstrap
checkAuth();