/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, GraduationCap, Briefcase, ArrowLeft, BookOpen, LayoutDashboard, CheckSquare, Calendar, Settings, LogOut, Plus, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

type Screen = 'landing' | 'login' | 'signup' | 'dashboard';
type UserRole = 'student' | 'instructor';

interface ClassData {
  class_id: number;
  name: string;
  subject: string;
  title: string;
  class_code: string;
  instructor_name?: string;
  student_count?: number;
}

interface Message {
  message_id: number;
  class_id: number;
  sender_id: number;
  sender_name: string;
  title?: string;
  content: string;
  type: 'announcement' | 'assignment';
  due_date?: string;
  attachments?: string; // JSON string
  sent_at: string;
  comments: Comment[];
}

interface Comment {
  comment_id: number;
  message_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  sent_at: string;
}

interface Submission {
  submission_id: number;
  message_id: number;
  student_id: number;
  student_name?: string;
  content: string;
  attachments: string;
  grade?: string;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
}

const TodoView = ({ assignments, onSelect }: { assignments: (Message & { class_name: string })[], onSelect: (m: Message) => void }) => {
  const [activeFilter, setActiveFilter] = useState<'assigned' | 'missing' | 'done'>('assigned');
  
  const filtered = assignments.filter(a => {
    const isPast = a.due_date ? new Date(a.due_date) < new Date() : false;
    if (activeFilter === 'assigned') return !isPast;
    if (activeFilter === 'missing') return isPast;
    return false;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      <header>
        <h2 className="text-3xl font-display font-bold text-slate-800">To-do</h2>
        <p className="text-slate-400 font-medium">All your assignments in one place</p>
      </header>

      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        {['assigned', 'missing', 'done'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f as any)}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(a => (
          <div 
            key={a.message_id}
            onClick={() => onSelect(a)}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <CheckSquare size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{a.class_name}</p>
              <h4 className="font-bold text-slate-800">{a.title}</h4>
              <p className="text-xs text-slate-400">Posted {new Date(a.sent_at).toLocaleDateString()}</p>
            </div>
            {a.due_date && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due</p>
                <p className={`text-sm font-bold ${new Date(a.due_date) < new Date() ? 'text-rose-500' : 'text-indigo-600'}`}>{new Date(a.due_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <CheckSquare size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-800">No assignments found</p>
              <p className="text-xs text-slate-400">Assignments will appear here once you join a class or they are posted.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CalendarView = ({ assignments, onSelect }: { assignments: (Message & { class_name: string })[], onSelect: (m: Message) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= days; i++) calendarDays.push(i);

  const getAssignmentsForDay = (day: number) => {
    return assignments.filter(a => {
      if (!a.due_date) return false;
      const d = new Date(a.due_date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-800">Calendar</h2>
          <p className="text-slate-400 font-medium">Keep track of your deadlines</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><ChevronLeft size={20} /></button>
          <span className="font-display font-bold text-slate-800 min-w-32 text-center uppercase tracking-widest text-sm">{monthName} {year}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><ChevronRight size={20} /></button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayAssignments = day ? getAssignmentsForDay(day) : [];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            
            return (
              <div key={idx} className={`min-h-32 p-4 border-b border-r border-slate-100 last:border-r-0 transition-all ${day ? 'hover:bg-indigo-50/30' : 'bg-slate-50/30'}`}>
                {day && (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayAssignments.map(a => (
                        <div 
                          key={a.message_id} 
                          onClick={() => onSelect(a)}
                          className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-[10px] font-bold text-indigo-700 truncate cursor-pointer hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          {a.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AuthLayout = ({ children, title, subtitle, onBack }: { children: React.ReactNode, title: string, subtitle: string, onBack: () => void }) => (
  <div className="w-full max-w-[900px] min-h-[600px] bg-white rounded-3xl shadow-2xl flex overflow-hidden border border-slate-200">
    {/* Left Sidebar decorative */}
    <div className="hidden md:flex w-5/12 bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-20 -mt-20 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-700 rounded-full -ml-10 -mb-10 opacity-30"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-xl font-bold tracking-tight font-display">GIKLASS</span>
        </div>
        <h1 className="text-4xl font-semibold leading-tight mb-4 font-display">The hub for modern learning.</h1>
        <p className="text-indigo-100 text-lg opacity-90">Collaborative tools and classroom management in one sleek package.</p>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="flex -space-x-3 mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-300 flex items-center justify-center text-xs font-bold text-indigo-900">
              U{i}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-900">
            +12
          </div>
        </div>
        <p className="text-sm text-indigo-100">Join thousands of students and instructors managing their journey here.</p>
      </div>
    </div>

    {/* Right Content */}
    <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white relative">
      <button 
        onClick={onBack}
        className="absolute left-6 top-6 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 font-display">{title}</h2>
        <p className="text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [dashboardView, setDashboardView] = useState<'classes' | 'todo' | 'calendar'>('classes');
  const [allAssignments, setAllAssignments] = useState<(Message & { class_name: string })[]>([]);
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [showModal, setShowModal] = useState<'create' | 'join' | 'post' | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [stream, setStream] = useState<Message[]>([]);
  const [people, setPeople] = useState<{instructor: any, students: any[]}>({ instructor: null, students: [] });
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people'>('stream');
  
  // Submission/Grading state
  const [selectedAssignment, setSelectedAssignment] = useState<Message | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionModal, setSubmissionModal] = useState<boolean>(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionAttachments, setSubmissionAttachments] = useState<{name: string, size: number}[]>([]);
  const [gradingModal, setGradingModal] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [programme, setProgramme] = useState('');
  const [year, setYear] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');

  // Class form states
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [classCodeInput, setClassCodeInput] = useState('');

  // Stream form states
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'announcement' | 'assignment'>('announcement');
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('');
  const [attachments, setAttachments] = useState<{name: string, size: number}[]>([]);
  const [commentInput, setCommentInput] = useState<{[key: number]: string}>({});

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    setError('');
    // Clear sensitive fields when switching between auth screens
    if (screen === 'login' || screen === 'signup' || screen === 'landing') {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setRollNumber('');
      setProgramme('');
      setYear('');
      setPhone('');
      setAddress('');
      setDepartment('');
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'dashboard') {
      fetchClasses();
      fetchAllAssignments();
    }
  }, [screen]);

  const fetchAllAssignments = async () => {
    try {
      const res = await fetch('/api/messages/all-assignments');
      if (res.ok) {
        const data = await res.json();
        setAllAssignments(data);
      }
    } catch (e) {
      console.error('Failed to fetch assignments');
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchStream(selectedClass.class_id);
      fetchPeople(selectedClass.class_id);
      setSelectedAssignment(null);
    }
  }, [selectedClass]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setScreen('dashboard');
      }
    } catch (e) {
      console.error('Auth check failed');
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      } else {
        setClasses([]);
      }
    } catch (e) {
      console.error('Failed to fetch classes');
      setClasses([]);
    }
  };

  const fetchStream = async (classId: number) => {
    try {
      const res = await fetch(`/api/messages/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setStream(data);
      }
    } catch (e) {
      console.error('Failed to fetch stream');
    }
  };

  const fetchPeople = async (classId: number) => {
    try {
      const res = await fetch(`/api/classes/people/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setPeople(data);
      }
    } catch (e) {
      console.error('Failed to fetch people');
    }
  };

  const fetchSubmissions = async (messageId: number) => {
    try {
      const res = await fetch(`/api/messages/submissions/${messageId}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (e) {
      console.error('Failed to fetch submissions');
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/messages/submit/${selectedAssignment.message_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: submissionContent, 
          attachments: submissionAttachments 
        }),
      });
      if (res.ok) {
        setSubmissionModal(false);
        setSubmissionContent('');
        setSubmissionAttachments([]);
        fetchSubmissions(selectedAssignment.message_id);
      }
    } catch (e) {
      alert('Failed to submit work');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingModal) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/messages/grade/${gradingModal.submission_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          grade: gradeInput, 
          feedback: feedbackInput 
        }),
      });
      if (res.ok) {
        setGradingModal(null);
        setGradeInput('');
        setFeedbackInput('');
        if (selectedAssignment) fetchSubmissions(selectedAssignment.message_id);
      }
    } catch (e) {
      alert('Failed to save grade');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setIsLoading(true);

    const dueDate = postDate && postTime ? `${postDate}T${postTime}` : undefined;

    try {
      const res = await fetch(`/api/messages/${selectedClass.class_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: postContent, 
          title: postTitle, 
          type: postType, 
          dueDate,
          attachments: attachments.map(a => ({ name: a.name, size: a.size }))
        }),
      });
      if (res.ok) {
        await fetchStream(selectedClass.class_id);
        await fetchAllAssignments();
        setShowModal(null);
        setPostContent('');
        setPostTitle('');
        setPostDate('');
        setPostTime('');
        setAttachments([]);
      }
    } catch (e) {
      alert('Failed to post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((f: File) => ({ name: f.name, size: f.size }));
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostComment = async (messageId: number) => {
    const content = commentInput[messageId];
    if (!content?.trim()) return;
    try {
      const res = await fetch(`/api/messages/comment/${messageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setCommentInput(prev => ({ ...prev, [messageId]: '' }));
        if (selectedClass) fetchStream(selectedClass.class_id);
      }
    } catch (e) {
      console.error('Failed to post comment');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Reset state before showing dashboard
        setClasses([]);
        setAllAssignments([]);
        setStream([]);
        setSelectedClass(null);
        setSelectedAssignment(null);
        
        setUser({ name: data.user.name, role: data.role });
        setScreen('dashboard');
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const details = role === 'student' 
      ? { rollNumber, programme, year: parseInt(year) }
      : { phone, address, department };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password: password.trim(), 
          role, 
          details 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Reset state before showing dashboard
        setClasses([]);
        setAllAssignments([]);
        setStream([]);
        setSelectedClass(null);
        setSelectedAssignment(null);

        setUser({ name, role });
        setScreen('dashboard');
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className, subject, title }),
      });
      if (res.ok) {
        await fetchClasses();
        setShowModal(null);
        setClassName('');
        setSubject('');
        setTitle('');
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      alert('Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode: classCodeInput }),
      });
      if (res.ok) {
        await fetchClasses();
        setShowModal(null);
        setClassCodeInput('');
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      alert('Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setClasses([]);
    setAllAssignments([]);
    setStream([]);
    setSelectedClass(null);
    setSelectedAssignment(null);
    setDashboardView('classes');
    setScreen('landing');
  };

  const handleDownload = (fileName: string) => {
    // Generate a simple text blob as a mock file
    const content = `Mock content for file: ${fileName}\nIn a real app, this would fetch the binary data from storage.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
          >
            {/* Background Decorations */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob [animation-delay:2s]"></div>
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob [animation-delay:4s]"></div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center space-y-12"
            >
              <div className="flex flex-col items-center space-y-4">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 mb-4"
                >
                  <BookOpen size={40} className="text-white" />
                </motion.div>
                <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-slate-900">
                  GI<span className="text-indigo-600 text-shadow-sm">KLASS</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                  The digital workspace that brings students and instructors together. 
                  Streamlined, social, and <span className="text-indigo-600 italic">insanely</span> productive.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg items-center">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setScreen('signup')}
                  className="group w-full sm:flex-1 relative inline-flex items-center justify-center px-8 py-5 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-xl shadow-indigo-100"
                >
                  Create Account
                  <ArrowLeft size={20} className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setScreen('login')}
                  className="w-full sm:flex-1 inline-flex items-center justify-center px-8 py-5 font-bold text-slate-700 transition-all duration-200 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                >
                  Sign In
                </motion.button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
                {[
                  { label: "Assignment Tracking", icon: <CheckSquare className="w-5 h-5" /> },
                  { label: "Smart Calendar", icon: <Calendar className="w-5 h-5" /> },
                  { label: "Real-time Stream", icon: <LayoutDashboard className="w-5 h-5" /> },
                  { label: "Grade Insights", icon: <Briefcase className="w-5 h-5" /> }
                ].map((feature, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    key={i} 
                    className="flex items-center gap-3 text-slate-400"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      {feature.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {(screen === 'login' || screen === 'signup') && (
          <div className="p-4 w-full flex justify-center">
            {screen === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex justify-center">
                <AuthLayout title="Welcome Back" subtitle="Please enter your details to sign in" onBack={() => setScreen('landing')}>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="login-email" className="text-sm font-semibold text-slate-700 block ml-1 leading-none">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                        <input id="login-email" type="email" placeholder="m@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label htmlFor="login-password" className="text-sm font-semibold text-slate-700 leading-none">Password</label>
                        <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                        <input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                      </div>
                    </div>
                    {error && <p className="text-rose-500 text-xs font-medium text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all shadow-lg hover:translate-y-[-1px]">
                      {isLoading ? 'Signing in...' : 'Sign in to Classroom'}
                    </button>
                  </form>
                  <p className="mt-8 text-center text-sm text-slate-500">
                    New to Classroom? <button onClick={() => setScreen('signup')} className="text-indigo-600 font-bold hover:underline">Create account</button>
                  </p>
                </AuthLayout>
              </motion.div>
            ) : (
              <motion.div key="signup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex justify-center">
                <AuthLayout title="Get Started" subtitle="Create your classroom profile" onBack={() => setScreen('landing')}>
                  <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-8">
                    <button onClick={() => setRole('student')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${role === 'student' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><GraduationCap size={18} /> Student</button>
                    <button onClick={() => setRole('instructor')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${role === 'instructor' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Briefcase size={18} /> Instructor</button>
                  </div>
                  <form onSubmit={handleSignup} className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-1">
                      <label htmlFor="signup-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 leading-none">Full Name</label>
                      <input id="signup-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="signup-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 leading-none">Email</label>
                      <input id="signup-email" type="email" placeholder="m@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="signup-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 leading-none">Password</label>
                      <input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="signup-confirm-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 leading-none">Confirm Password</label>
                      <input id="signup-confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    {role === 'student' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label htmlFor="signup-roll" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Roll #</label>
                            <input id="signup-roll" type="text" placeholder="FA21-CS-001" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
                          </div>
                          <div className="space-y-1">
                            <label htmlFor="signup-year" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Year</label>
                            <input id="signup-year" type="number" placeholder="3" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="signup-prog" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 leading-none">Programme</label>
                          <input id="signup-prog" type="text" placeholder="BS Computer Science" value={programme} onChange={(e) => setProgramme(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label htmlFor="signup-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Phone</label>
                            <input id="signup-phone" type="text" placeholder="+123..." value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                          </div>
                          <div className="space-y-1">
                            <label htmlFor="signup-dept" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Dept.</label>
                            <input id="signup-dept" type="text" placeholder="Computer Science" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="signup-address" className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 leading-none">Address</label>
                          <textarea id="signup-address" placeholder="Office room, building..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-[80px]" />
                        </div>
                      </>
                    )}
                    {error && <p className="text-rose-500 text-xs font-medium text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg mt-4 disabled:opacity-50">
                      {isLoading ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                  </form>
                </AuthLayout>
              </motion.div>
            )}
          </div>
        )}

        {screen === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between py-8 px-6 fixed h-full z-20">
              <div className="space-y-8">
                <div onClick={() => setSelectedClass(null)} className="flex items-center gap-3 px-2 cursor-pointer">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
                  <span className="font-display font-bold text-lg text-slate-800">GIKLASS</span>
                </div>
                <nav className="space-y-1">
                  <button 
                    onClick={() => { setSelectedClass(null); setDashboardView('classes'); }} 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${(!selectedClass && dashboardView === 'classes') ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </button>
                  <button 
                    onClick={() => { setSelectedClass(null); setDashboardView('todo'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${(!selectedClass && dashboardView === 'todo') ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}
                  >
                    <CheckSquare size={18} /> To do
                  </button>
                  <button 
                    onClick={() => { setSelectedClass(null); setDashboardView('calendar'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${(!selectedClass && dashboardView === 'calendar') ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}
                  >
                    <Calendar size={18} /> Calendar
                  </button>
                </nav>
                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setShowModal(user?.role === 'instructor' ? 'create' : 'join')}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-50 hover:scale-[1.02] transition-all"
                  >
                    <Plus size={20} /> {user?.role === 'instructor' ? 'Create Class' : 'Join Class'}
                  </button>
                </div>
                
                {/* Enrolled Classes List */}
                <div className="pt-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Your Classes</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1 px-2">
                    {classes.map(cls => (
                      <button 
                        key={cls.class_id}
                        onClick={() => setSelectedClass(cls)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate font-medium ${selectedClass?.class_id === cls.class_id ? 'bg-slate-100 text-indigo-600 border border-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {cls.name}
                      </button>
                    ))}
                    {classes.length === 0 && (
                      <div className="text-[10px] text-slate-400 italic px-2 py-2 bg-slate-50 rounded-lg border border-dashed border-slate-100">
                        No classes yet. Use the button above to get started.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-medium transition-all"><Settings size={18} /> Settings</button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 font-medium transition-all"><LogOut size={18} /> Log out</button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 overflow-y-auto">
              {selectedAssignment ? (
                <div className="max-w-5xl mx-auto space-y-8 text-left">
                  <header className="flex items-center gap-4 mb-4">
                    <button onClick={() => setSelectedAssignment(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-all"><ArrowLeft size={24} /></button>
                    <div>
                      <h2 className="text-3xl font-display font-bold text-slate-800">{selectedAssignment.title}</h2>
                      <p className="text-slate-400 font-medium">{selectedAssignment.sender_name} • {new Date(selectedAssignment.sent_at).toLocaleDateString()}</p>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                        {selectedAssignment.content}
                      </div>

                      {selectedAssignment.attachments && JSON.parse(selectedAssignment.attachments).length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">Class Attachments</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {JSON.parse(selectedAssignment.attachments).map((file: any, idx: number) => (
                              <div 
                                key={idx} 
                                onClick={() => handleDownload(file.name)}
                                className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <BookOpen size={20} className="text-indigo-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{file.name}</p>
                                    <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                  </div>
                                </div>
                                <Download size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Instructor View: List of Submissions */}
                      {user?.role === 'instructor' && (
                        <div className="space-y-4 pt-8">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Student Submissions</h3>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{submissions.length} submitted</span>
                          </div>
                          <div className="space-y-4">
                            {submissions.map(sub => (
                              <div key={sub.submission_id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                                    <User size={20} className="mt-1" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800">{sub.student_name}</p>
                                    <p className="text-xs text-slate-400">Submitted {new Date(sub.submitted_at).toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  {sub.grade ? (
                                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">Grade: {sub.grade}</span>
                                  ) : (
                                    <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100">Not Graded</span>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setGradingModal(sub);
                                      setGradeInput(sub.grade || '');
                                      setFeedbackInput(sub.feedback || '');
                                    }}
                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <Settings size={20} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {submissions.length === 0 && (
                              <div className="py-12 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                <Mail size={40} className="mb-4 opacity-50" />
                                <p className="font-medium italic">No submissions yet.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                      {/* Submission Status for Students */}
                      {user?.role === 'student' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-indigo-50 space-y-6">
                          <div className="flex justify-between items-center bg-slate-50 -mx-8 -mt-8 p-8 rounded-t-[2.5rem] border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">Your work</h3>
                            {submissions.length > 0 ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">Turned In</span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-widest">Missing</span>
                            )}
                          </div>

                          {submissions.length > 0 && (
                            <div className="space-y-4">
                              {submissions[0].grade && (
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Grade</p>
                                  <p className="text-3xl font-display font-bold text-indigo-600">{submissions[0].grade}</p>
                                  {submissions[0].feedback && (
                                    <div className="mt-3 pt-3 border-t border-indigo-100 text-sm text-indigo-700 italic">
                                      "{submissions[0].feedback}"
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Attachments</p>
                                {submissions[0].attachments && JSON.parse(submissions[0].attachments).map((file: any, idx: number) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => handleDownload(file.name)}
                                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2 text-sm cursor-pointer hover:bg-white transition-colors group"
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <BookOpen size={14} className="text-indigo-600 flex-shrink-0" />
                                      <span className="truncate flex-1 font-medium">{file.name}</span>
                                    </div>
                                    <Download size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                  </div>
                                ))}
                              </div>
                              <button 
                                onClick={() => {
                                  setSubmissionModal(true);
                                  setSubmissionContent(submissions[0].content);
                                }}
                                className="w-full py-4 rounded-2xl border-2 border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-50 transition-all"
                              >
                                Unsubmit & Edit
                              </button>
                            </div>
                          )}

                          {submissions.length === 0 && (
                            <>
                              <div className="py-10 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                                <Plus size={32} className="mb-2 opacity-50" />
                                <p className="text-xs font-semibold">No work attached</p>
                              </div>
                              <button 
                                onClick={() => setSubmissionModal(true)}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-all"
                              >
                                Submit Work
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Assignment Info</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><Calendar size={18} /></div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Due Date</p>
                              <p className="text-sm font-bold text-slate-800">{selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleString() : 'No due date'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><CheckSquare size={18} /></div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                              <p className="text-sm font-bold text-slate-800">Closed for new students</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !selectedClass ? (
                <>
                  {dashboardView === 'classes' && (
                    <>
                      <header className="flex justify-between items-center mb-10">
                        <div>
                          <h2 className="text-3xl font-display font-bold text-slate-800">Dashboard</h2>
                          <div className="flex items-center gap-2">
                            <p className="text-slate-400 font-medium">Welcome back, {user?.name}</p>
                            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{user?.role}</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm ring-1 ring-indigo-50 overflow-hidden">
                          <User size={24} className="mt-2" />
                        </div>
                      </header>

                      <section>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-slate-700 uppercase tracking-wider">{user?.role === 'instructor' ? 'Created Classes' : 'Enrolled Classes'}</h3>
                          <button 
                            onClick={() => setShowModal(user?.role === 'instructor' ? 'create' : 'join')}
                            className="text-indigo-600 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-all"
                          >
                            <Plus size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
                          {classes.map(cls => (
                            <motion.div 
                              key={cls.class_id}
                              whileHover={{ y: -4 }}
                              onClick={() => setSelectedClass(cls)}
                              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full -mr-8 -mt-8"></div>
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{cls.subject}</span>
                                <h4 className="text-xl font-bold text-slate-800">{cls.name}</h4>
                                <p className="text-sm text-slate-400 font-medium">{cls.title}</p>
                              </div>
                              <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                     {cls.instructor_name ? cls.instructor_name.split(' ').map(n=>n[0]).join('') : 'INST'}
                                   </div>
                                   <span className="text-xs font-semibold text-slate-500">{cls.instructor_name || 'Instructor'}</span>
                                </div>
                                {user?.role === 'instructor' && (
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-lg">
                                    Code: <span className="text-indigo-600 select-all">{cls.class_code}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          
                          {classes.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10">
                              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                <BookOpen size={40} />
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-800">Your class list is empty</h4>
                                <p className="text-slate-500 max-w-md mx-auto">Get started by {user?.role === 'instructor' ? 'creating a new class for your students' : 'joining a class with a code from your instructor'}.</p>
                              </div>
                              <button 
                                onClick={() => setShowModal(user?.role === 'instructor' ? 'create' : 'join')}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
                              >
                                <Plus size={20} /> {user?.role === 'instructor' ? 'Create Your First Class' : 'Join Your First Class'}
                              </button>
                            </div>
                          )}
                        </div>
                      </section>
                    </>
                  )}

                  {dashboardView === 'todo' && <TodoView assignments={allAssignments} onSelect={(a) => { setSelectedAssignment(a); fetchSubmissions(a.message_id); }} />}
                  {dashboardView === 'calendar' && <CalendarView assignments={allAssignments} onSelect={(a) => { setSelectedAssignment(a); fetchSubmissions(a.message_id); }} />}
                </>
              ) : (
                <div className="space-y-8">
                  {/* Class Header */}
                  <div className="relative h-64 bg-indigo-600 rounded-[2.5rem] p-10 flex flex-col justify-end text-white overflow-hidden shadow-2xl shadow-indigo-100">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full opacity-30 -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-700 rounded-full opacity-20 -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10 flex justify-between items-end">
                      <div>
                        <h1 className="text-5xl font-display font-bold mb-2 tracking-tight">{selectedClass.name}</h1>
                        <p className="text-xl opacity-90 font-medium">{selectedClass.subject} • {selectedClass.title}</p>
                      </div>
                      {user?.role === 'instructor' && (
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center">
                          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">Class Code</p>
                          <p className="text-2xl font-display font-bold tracking-widest">{selectedClass.class_code}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                    {['stream', 'classwork', 'people'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'stream' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
                      {/* Left: Upcoming */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest">Upcoming</h4>
                          <div className="space-y-4">
                            {stream
                              .filter(m => m.type === 'assignment' && m.due_date && new Date(m.due_date) > new Date())
                              .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                              .slice(0, 3).map(m => (
                              <div 
                                key={m.message_id} 
                                onClick={() => {
                                  setSelectedAssignment(m);
                                  fetchSubmissions(m.message_id);
                                }}
                                className="text-sm cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-all group"
                              >
                                <p className="font-bold text-indigo-600 mb-1 group-hover:text-indigo-700">Due {new Date(m.due_date!).toLocaleDateString()}</p>
                                <p className="text-slate-600 truncate font-medium">{m.title}</p>
                              </div>
                            ))}
                            {stream.filter(m => m.type === 'assignment' && m.due_date && new Date(m.due_date) > new Date()).length === 0 && (
                              <p className="text-slate-400 text-[11px] italic leading-relaxed">Woohoo, no work due soon!</p>
                            )}
                          </div>
                   <button 
                    onClick={() => setActiveTab('classwork')}
                    className="mt-6 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View all
                  </button>
                        </div>
                      </div>

                      {/* Right: Feed */}
                      <div className="lg:col-span-3 space-y-6">
                        {/* Post Box */}
                        <div onClick={() => setShowModal('post')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all group">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold overflow-hidden border-2 border-white shadow-sm ring-1 ring-indigo-50">
                            <User size={20} className="mt-2" />
                          </div>
                          <span className="text-slate-400 font-medium group-hover:text-slate-500 transition-colors">Announce something to your class</span>
                        </div>

                        {/* Stream Messages */}
                        <div className="space-y-6">
                          {stream.map(message => (
                            <motion.div 
                              key={message.message_id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => {
                                if (message.type === 'assignment') {
                                  setSelectedAssignment(message);
                                  fetchSubmissions(message.message_id);
                                }
                              }}
                              className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all ${message.type === 'assignment' ? 'cursor-pointer hover:shadow-md hover:border-indigo-100' : ''}`}
                            >
                              <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold overflow-hidden border-2 border-white shadow-sm ring-1 ring-indigo-50">
                                      <User size={20} className="mt-2" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 leading-none mb-1">{message.sender_name}</p>
                                      <p className="text-xs text-slate-400 font-medium">{new Date(message.sent_at).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  {message.type === 'assignment' && (
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                      <CheckSquare size={12} /> Assignment
                                    </div>
                                  )}
                                </div>

                                {message.title && (
                                  <h5 className="text-xl font-bold text-slate-800 mb-3">{message.title}</h5>
                                )}
                                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed mb-6">
                                  {message.type === 'assignment' && (
                                    <div className="flex justify-between items-center bg-indigo-50 px-4 py-2 rounded-xl mb-4 group-hover:bg-indigo-100 transition-all">
                                      <div className="flex items-center gap-2">
                                        <CheckSquare size={16} className="text-indigo-600" />
                                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Assignment details</span>
                                      </div>
                                      <span className="text-[10px] font-bold text-indigo-400">OPEN</span>
                                    </div>
                                  )}
                                  {message.content}
                                </div>

                                 {message.due_date && (
                                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 mb-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Calendar size={20} />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
                                        <p className="font-bold text-slate-800">{new Date(message.due_date).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {message.attachments && JSON.parse(message.attachments).length > 0 && (
                                  <div className="space-y-2 mb-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Attachments</p>
                                    <div className="flex flex-wrap gap-2">
                                      {JSON.parse(message.attachments).map((file: any, idx: number) => (
                                        <div 
                                          key={idx} 
                                          onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }}
                                          className="bg-slate-50 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group"
                                        >
                                          <div className="flex items-center gap-3 overflow-hidden">
                                            <BookOpen size={16} className="text-indigo-600 flex-shrink-0" />
                                            <div>
                                              <p className="font-bold text-slate-800 leading-tight truncate max-w-[150px]">{file.name}</p>
                                              <p className="text-[10px] text-slate-400 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                          </div>
                                          <Download size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Comments Section */}
                              <div className="bg-slate-50 p-6 border-t border-slate-100 space-y-6">
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                  <User size={16} />
                                  <span className="text-xs font-bold uppercase tracking-widest">{message.comments.length} Class comments</span>
                                </div>
                                
                                {message.comments.map(comment => (
                                  <div key={comment.comment_id} className="flex gap-3">
                                    <div className="w-8 h-8 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-100">
                                      <User size={16} className="text-slate-300 mt-2" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-baseline gap-2 mb-1">
                                        <p className="text-sm font-bold text-slate-800">{comment.sender_name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{new Date(comment.sent_at).toLocaleDateString()}</p>
                                      </div>
                                      <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}

                                <div className="flex gap-4 items-center">
                                  <div className="w-8 h-8 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-100">
                                    <User size={16} className="text-slate-300 mt-2" />
                                  </div>
                                  <div className="flex-1 relative">
                                    <input 
                                      type="text" 
                                      placeholder="Add class comment..."
                                      value={commentInput[message.message_id] || ''}
                                      onChange={(e) => setCommentInput(prev => ({ ...prev, [message.message_id]: e.target.value }))}
                                      onKeyDown={(e) => e.key === 'Enter' && handlePostComment(message.message_id)}
                                      className="w-full bg-white px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all pr-12"
                                    />
                                    <button 
                                      onClick={() => handlePostComment(message.message_id)}
                                      disabled={!commentInput[message.message_id]?.trim()}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 disabled:opacity-30 p-1 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                      <ArrowLeft size={18} className="rotate-180" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'classwork' && (
                    <div className="max-w-4xl mx-auto space-y-8 text-left py-4">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-display font-bold text-slate-800">Classwork</h3>
                        {user?.role === 'instructor' && (
                          <button 
                            onClick={() => { setPostType('assignment'); setShowModal('post'); }}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
                          >
                            <Plus size={20} /> Create Assignment
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {stream.filter(m => m.type === 'assignment').map(assignment => (
                          <motion.div 
                            key={assignment.message_id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              fetchSubmissions(assignment.message_id);
                            }}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6 cursor-pointer hover:shadow-md transition-all group"
                          >
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <CheckSquare size={24} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-800">{assignment.title}</h4>
                              <p className="text-xs text-slate-400 font-medium">Posted {new Date(assignment.sent_at).toLocaleDateString()}</p>
                            </div>
                            {assignment.due_date && (
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                <p className="text-sm font-bold text-rose-500">{new Date(assignment.due_date).toLocaleDateString()}</p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                        {stream.filter(m => m.type === 'assignment').length === 0 && (
                          <div className="py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2rem]">
                            <Briefcase size={48} className="mb-4 opacity-50" />
                            <p className="font-semibold italic">No assignments have been posted yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'people' && (
                    <div className="max-w-3xl mx-auto space-y-12 py-8 text-left">
                      {/* Teachers Section */}
                      <section>
                        <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-4 mb-8">
                          <h3 className="text-3xl font-display font-bold text-indigo-600">Teachers</h3>
                          <span className="text-sm font-bold text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">1 Instructor</span>
                        </div>
                        {people.instructor && (
                          <div className="flex items-center gap-4 px-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold overflow-hidden border-2 border-white shadow-sm ring-1 ring-indigo-50">
                              <User size={24} className="mt-2" />
                            </div>
                            <p className="text-lg font-bold text-slate-800">{people.instructor.name}</p>
                          </div>
                        )}
                      </section>

                      {/* Students Section */}
                      <section>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-8">
                          <h3 className="text-3xl font-display font-bold text-slate-800">Students</h3>
                          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">{people.students.length} Students</span>
                        </div>
                        <div className="space-y-6">
                          {people.students.map((student, idx) => (
                            <motion.div 
                              key={idx} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-center gap-4 px-4 group"
                            >
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold overflow-hidden border-2 border-white shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <User size={20} className="mt-2" />
                              </div>
                              <p className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{student.name}</p>
                            </motion.div>
                          ))}
                          {people.students.length === 0 && (
                            <p className="text-slate-400 italic px-4">No students enrolled yet.</p>
                          )}
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 md:p-10 border border-slate-100"
            >
              <button 
                onClick={() => setShowModal(null)}
                className="absolute right-6 top-6 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-display font-bold text-slate-800 mb-8 pr-8">
                {showModal === 'create' ? 'Create a New Class' : 
                 showModal === 'join' ? 'Join a Class' : 'Post to Class'}
              </h2>

              {showModal === 'post' ? (
                <form onSubmit={handlePostMessage} className="space-y-6">
                  {user?.role === 'instructor' && (
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-2">
                      <button 
                        type="button"
                        onClick={() => setPostType('announcement')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${postType === 'announcement' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                      >
                        Announcement
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPostType('assignment')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${postType === 'assignment' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                      >
                        Assignment
                      </button>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">{postType === 'assignment' ? 'Assignment Title' : 'Title (Optional)'}</label>
                    <input 
                      type="text" placeholder="e.g. Weekly Updates" 
                      value={postTitle} onChange={(e) => setPostTitle(e.target.value)}
                      required={postType === 'assignment'}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      placeholder="Share with the class..." required 
                      value={postContent} onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium min-h-[150px]"
                    />
                  </div>

                  {postType === 'assignment' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Due Date</label>
                        <input 
                          type="date" required 
                          value={postDate} onChange={(e) => setPostDate(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Time</label>
                        <input 
                          type="time" required 
                          value={postTime} onChange={(e) => setPostTime(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* Attachments UI */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Attachments</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="bg-slate-100 px-3 py-2 rounded-xl flex items-center gap-2 text-sm border border-slate-200">
                          <BookOpen size={14} className="text-indigo-600" />
                          <span className="max-w-[150px] truncate">{file.name}</span>
                          <button onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-rose-500"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                    <label className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all text-slate-400 font-bold">
                      <Plus size={20} /> Add Files
                      <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" onClick={() => setShowModal(null)}
                      className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" disabled={isLoading || !postContent}
                      className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-50 disabled:opacity-50 transition-all"
                    >
                      {isLoading ? 'Posting...' : 'Post Now'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={showModal === 'create' ? handleCreateClass : handleJoinClass} className="space-y-5">
                  {showModal === 'create' ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Class Name</label>
                        <input 
                          type="text" placeholder="e.g. Advanced AI" required 
                          value={className} onChange={(e) => setClassName(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Subject</label>
                        <input 
                          type="text" placeholder="e.g. CS202" required 
                          value={subject} onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Description / Room</label>
                        <input 
                          type="text" placeholder="e.g. Lab 4, Block B" required 
                          value={title} onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Enter Class Code</label>
                      <input 
                        type="text" placeholder="XXXXXX" required 
                        value={classCodeInput} onChange={(e) => setClassCodeInput(e.target.value)}
                        className="w-full px-5 py-6 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-display text-2xl font-bold tracking-[0.5em] text-center text-indigo-600 uppercase"
                      />
                      <p className="text-center text-xs text-slate-400 font-medium">Ask your instructor for the 6-character code.</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" onClick={() => setShowModal(null)}
                      className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" disabled={isLoading}
                      className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-50 disabled:opacity-50 transition-all"
                    >
                      {isLoading ? 'Wait...' : showModal === 'create' ? 'Create' : 'Join'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
        {/* Submission Modal */}
        {submissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSubmissionModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 md:p-10 border border-slate-100"
            >
              <h2 className="text-2xl font-display font-bold text-slate-800 mb-8">Submit Your Work</h2>
              <form onSubmit={handleSubmitWork} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Your Message (Optional)</label>
                  <textarea 
                    placeholder="Add details about your submission..." 
                    value={submissionContent} onChange={(e) => setSubmissionContent(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium min-h-[120px]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Attachments</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {submissionAttachments.map((file, idx) => (
                      <div key={idx} className="bg-slate-100 px-3 py-2 rounded-xl flex items-center gap-2 text-sm border border-slate-200">
                        <BookOpen size={14} className="text-indigo-600" />
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button type="button" onClick={() => setSubmissionAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <label className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all text-slate-400 font-bold">
                    <Plus size={20} /> Attach Files
                    <input type="file" multiple className="hidden" onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files).map((f: File) => ({ name: f.name, size: f.size }));
                        setSubmissionAttachments(prev => [...prev, ...files]);
                      }
                    }} />
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setSubmissionModal(false)} className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-100 transition-all">Cancel</button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all">
                    {isLoading ? 'Submitting...' : 'Submit Now'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Grading Modal */}
        {gradingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setGradingModal(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 md:p-10 border border-slate-100"
            >
              <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Grade: {gradingModal.student_name}</h2>
              <p className="text-slate-400 text-sm mb-8">Submitted on {new Date(gradingModal.submitted_at).toLocaleString()}</p>

              <div className="mb-8 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm italic">
                  "{gradingModal.content || 'No message provided'}"
                </div>
                <div className="flex flex-wrap gap-2">
                  {gradingModal.attachments && JSON.parse(gradingModal.attachments).map((file: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-2 text-xs font-medium shadow-sm">
                      <BookOpen size={14} className="text-indigo-600" />
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGradeSubmission} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Grade (e.g. 95/100, A+)</label>
                  <input 
                    type="text" required 
                    value={gradeInput} onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Comments/Feedback</label>
                  <textarea 
                    placeholder="Well done! Keep it up." 
                    value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium min-h-[100px]"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setGradingModal(null)} className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-100 transition-all">Cancel</button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-50 disabled:opacity-50 transition-all">
                    {isLoading ? 'Saving...' : 'Save Grade'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


