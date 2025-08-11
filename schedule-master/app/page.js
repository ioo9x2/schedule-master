'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sendReservationEmail } from '../lib/emailService';

export default function Page() {
  const [isSessionAuthenticated, setIsSessionAuthenticated] = useState(false); // セッション認証状態
  const [password, setPassword] = useState('');
  const [reservations, setReservations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employees, setEmployees] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});
  const [loading, setLoading] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState('calendar'); // 'calendar', 'reservations', 'tasks', 'stakeholders'
  const [activeMobileTab, setActiveMobileTab] = useState('events'); // 'events', 'tasks'
  const [taskSortBy, setTaskSortBy] = useState('date'); // 'date', 'classification'
  const [taskFilterYear, setTaskFilterYear] = useState(currentDate.getFullYear());
  const [taskFilterMonth, setTaskFilterMonth] = useState(currentDate.getMonth());
  
  
  // Task management states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('add'); // 'add', 'edit'
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    classification: '面談',
    due_date: ''
  });
  
  // Stakeholder management states
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [stakeholderModalMode, setStakeholderModalMode] = useState('add'); // 'add', 'edit'
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [stakeholderFormData, setStakeholderFormData] = useState({
    name: '',
    email: '',
    active: true
  });

  // セッション認証ハンドラー
  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin2024';
    if (password === adminPassword) {
      setIsSessionAuthenticated(true);
      setPassword('');
    } else {
      alert('パスワードが正しくありません');
    }
  };

  const handleLogout = () => {
    setIsSessionAuthenticated(false);
    setPassword('');
  };

  // ページが認証済みかチェック（セッション全体で共有）
  const isPageAuthenticated = (pageName) => {
    return isSessionAuthenticated;
  };

  useEffect(() => {
    // カレンダー表示のために常にデータを取得
    fetchReservations();
    fetchEmployees();
    fetchTasks();
  }, []);

  // モーダルや認証画面が表示されているときにスクロールを無効化
  useEffect(() => {
    const shouldDisableScroll = 
      showReservationModal || 
      showTaskModal || 
      showStakeholderModal ||
      (currentPage === 'reservations' && !isPageAuthenticated('reservations')) ||
      (currentPage === 'tasks' && !isPageAuthenticated('tasks')) ||
      (currentPage === 'stakeholders' && !isPageAuthenticated('stakeholders'));
    
    if (shouldDisableScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // クリーンアップ関数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showReservationModal, showTaskModal, showStakeholderModal, currentPage, isSessionAuthenticated]);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees/all');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Task CRUD operations
  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskFormData),
      });

      if (response.ok) {
        alert('タスクを追加しました');
        setShowTaskModal(false);
        resetTaskForm();
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'タスクの追加に失敗しました');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('タスクの追加に失敗しました');
    }
  };

  const handleUpdateTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskFormData),
      });

      if (response.ok) {
        alert('タスクを更新しました');
        setShowTaskModal(false);
        resetTaskForm();
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'タスクの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('タスクの更新に失敗しました');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('このタスクを削除しますか？')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('タスクを削除しました');
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'タスクの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('タスクの削除に失敗しました');
    }
  };


  // Stakeholder CRUD operations
  const handleCreateStakeholder = async () => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stakeholderFormData),
      });

      if (response.ok) {
        alert('ステークホルダーを追加しました');
        setShowStakeholderModal(false);
        resetStakeholderForm();
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'ステークホルダーの追加に失敗しました');
      }
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      alert('ステークホルダーの追加に失敗しました');
    }
  };

  const handleUpdateStakeholder = async () => {
    try {
      const response = await fetch(`/api/employees/${selectedStakeholder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stakeholderFormData),
      });

      if (response.ok) {
        alert('ステークホルダーを更新しました');
        setShowStakeholderModal(false);
        resetStakeholderForm();
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'ステークホルダーの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      alert('ステークホルダーの更新に失敗しました');
    }
  };

  const handleDeleteStakeholder = async (stakeholderId) => {
    if (!confirm('このステークホルダーを削除しますか？')) return;

    try {
      const response = await fetch(`/api/employees/${stakeholderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('ステークホルダーを削除しました');
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'ステークホルダーの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      alert('ステークホルダーの削除に失敗しました');
    }
  };

  // Helper functions
  const resetTaskForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      classification: '面談',
      due_date: ''
    });
    setSelectedTask(null);
    setTaskModalMode('add');
  };

  const resetStakeholderForm = () => {
    setStakeholderFormData({
      name: '',
      email: '',
      active: true
    });
    setSelectedStakeholder(null);
    setStakeholderModalMode('add');
  };

  const openTaskModal = (mode, task = null) => {
    setTaskModalMode(mode);
    if (mode === 'edit' && task) {
      setSelectedTask(task);
      setTaskFormData({
        title: task.title,
        description: task.description,
        classification: task.classification,
        due_date: task.due_date
      });
    } else {
      resetTaskForm();
    }
    setShowTaskModal(true);
  };

  const openStakeholderModal = (mode, stakeholder = null) => {
    setStakeholderModalMode(mode);
    if (mode === 'edit' && stakeholder) {
      setSelectedStakeholder(stakeholder);
      setStakeholderFormData({
        name: stakeholder.name,
        email: stakeholder.email,
        active: stakeholder.active
      });
    } else {
      resetStakeholderForm();
    }
    setShowStakeholderModal(true);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 19; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute > 30) break;
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  };

  const isSlotReserved = (date, time) => {
    return reservations.some(reservation => 
      reservation.date === date && reservation.time === time
    );
  };

  const toggleDayExpansion = (date) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleReservation = async () => {
    if (!selectedSlot || !selectedEmployee || !employeeEmail) {
      alert('日付・時間、従業員、メールアドレスを入力してください');
      return;
    }

    if (!validateEmail(employeeEmail)) {
      alert('有効なメールアドレスを入力してください');
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) {
      alert('選択された従業員が見つかりません');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedSlot.date,
          time: selectedSlot.time,
          reservationName: employee.name,
          employeeEmail: employeeEmail,
        }),
      });

      if (response.ok) {
        try {
          await sendReservationEmail({
            date: selectedSlot.date,
            time: selectedSlot.time,
            reservationName: employee.name,
            employeeEmail: employeeEmail
          });
        } catch (emailError) {
          console.error('メール送信に失敗しましたが、予約は完了しています:', emailError);
        }
        
        alert('予約が完了しました。確認メールを送信いたします。');
        setSelectedSlot(null);
        setSelectedEmployee('');
        setEmployeeEmail('');
        setShowReservationModal(false);
        fetchReservations();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '予約に失敗しました');
      }
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('予約に失敗しました');
    }
    setLoading(false);
  };

  // Generate calendar data dynamically with reservation data
  const generateCalendarData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const weeks = [];
    let currentWeek = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedStartDay; i++) {
      currentWeek.push({ day: null, isEmpty: true });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (adjustedStartDay + day - 1) % 7;
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      // Get reservations and tasks for this specific date
      let events = [];
      
      // Add reservations
      const dayReservations = reservations.filter(reservation => reservation.date === dateStr);
      const reservationEvents = dayReservations.map(reservation => ({
        title: `面談`,
        time: reservation.time,
        type: 'interview',
        id: reservation.id
      }));
      
      // Add tasks (due on this date)
      const dayTasks = tasks.filter(task => task.due_date === dateStr);
      const taskEvents = dayTasks.map(task => ({
        title: task.title,
        time: '', // Tasks don't have specific times
        type: 'task',
        classification: task.classification,
        id: task.id,
        description: task.description
      }));
      
      events = [...reservationEvents, ...taskEvents];
      
      // Check if this is today's date
      const today = new Date();
      const isToday = day === today.getDate() && 
                     month === today.getMonth() && 
                     year === today.getFullYear();
      
      currentWeek.push({
        day,
        events,
        active: false, // Don't change day color for reservations
        isToday
      });
      
      // If we've filled a week (7 days) or reached the end of the month
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Add empty cells for remaining days in the last week
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push({ day: null, isEmpty: true });
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const calendarData = generateCalendarData(selectedYear, selectedMonth);

  // 各ページの認証ログインコンポーネント
  const renderLoginScreen = (pageName, pageTitle) => (
    <div className="flex-1 flex items-center justify-center relative">
      {/* ブラー・透過背景 */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/30"></div>
      
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-96 max-w-full mx-4 relative z-10 border border-white/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-500">パスワードを入力してください</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="パスワードを入力"
            />
          </div>
          <button
            onClick={() => handleLogin()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <div
      className="min-h-screen bg-gradient-to-br from-gray-100 to-purple-50 flex relative"
      onClick={(e) => {
        // Close expanded days when clicking outside calendar
        if (!e.target.closest('.calendar-container')) {
          setExpandedDays({});
        }
      }}
    >


      {/* Left Sidebar - Desktop */}
      <div className="fixed left-0 top-0 w-20 h-full bg-white flex-col items-center py-6 space-y-6 z-40 shadow-sm hidden lg:flex">
        
        {/* Logout Button for authenticated session */}
        {isSessionAuthenticated && (
          <button 
            onClick={() => handleLogout()}
            className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors mb-4" 
            title="ログアウト"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
        
        {/* Navigation Icons */}
        <nav className="flex flex-col space-y-4">
          {/* カレンダー */}
          <button 
            onClick={() => setCurrentPage('calendar')}
            className={`w-10 h-10 ${currentPage === 'calendar' ? 'bg-gray-800' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg flex items-center justify-center transition-colors`} 
            title="カレンダー"
          >
            <svg className={`w-5 h-5 ${currentPage === 'calendar' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          {/* 面談予約編集 */}
          <button 
            onClick={() => setCurrentPage('reservations')}
            className={`w-10 h-10 ${currentPage === 'reservations' ? 'bg-gray-800' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg flex items-center justify-center transition-colors`} 
            title="面談予約編集"
          >
            <svg className={`w-5 h-5 ${currentPage === 'reservations' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          
          {/* タスク編集 */}
          <button 
            onClick={() => setCurrentPage('tasks')}
            className={`w-10 h-10 ${currentPage === 'tasks' ? 'bg-gray-800' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg flex items-center justify-center transition-colors`} 
            title="タスク編集"
          >
            <svg className={`w-5 h-5 ${currentPage === 'tasks' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h9a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </button>
          
          {/* ステークホルダー編集 */}
          <button 
            onClick={() => setCurrentPage('stakeholders')}
            className={`w-10 h-10 ${currentPage === 'stakeholders' ? 'bg-gray-800' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg flex items-center justify-center transition-colors`} 
            title="ステークホルダー編集"
          >
            <svg className={`w-5 h-5 ${currentPage === 'stakeholders' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </button>
        </nav>
        
        
      </div>

      {/* Mobile Navigation - Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
        <nav className="flex justify-around py-2">
          <button 
            onClick={() => setCurrentPage('calendar')}
            className={`flex flex-col items-center p-2 ${currentPage === 'calendar' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">カレンダー</span>
          </button>
          <button 
            onClick={() => setCurrentPage('reservations')}
            className={`flex flex-col items-center p-2 ${currentPage === 'reservations' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs mt-1">予約</span>
          </button>
          <button 
            onClick={() => setCurrentPage('tasks')}
            className={`flex flex-col items-center p-2 ${currentPage === 'tasks' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h9a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-xs mt-1">タスク</span>
          </button>
          <button 
            onClick={() => setCurrentPage('stakeholders')}
            className={`flex flex-col items-center p-2 ${currentPage === 'stakeholders' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span className="text-xs mt-1">メンバー</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex lg:ml-20 pb-16 lg:pb-0">
        {currentPage === 'calendar' && (
        <>
        <div className="flex-1 p-4 lg:p-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 lg:mb-8">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center relative">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" fill="white" />
                </svg>
                <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-6 lg:h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 lg:w-3 lg:h-3 bg-orange-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm lg:text-base text-gray-500">Schedule master</p>
              </div>
            </div>

          </div>

          {/* Calendar Section with Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden calendar-container">
            {/* Calendar Header */}
            <div className="mb-6 p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          if (selectedMonth === 0) {
                            setSelectedMonth(11);
                            setSelectedYear(selectedYear - 1);
                          } else {
                            setSelectedMonth(selectedMonth - 1);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h2 className="text-lg font-bold text-gray-900 min-w-[200px] text-center">
                        {new Date(selectedYear, selectedMonth).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                      </h2>
                      <button
                        onClick={() => {
                          if (selectedMonth === 11) {
                            setSelectedMonth(0);
                            setSelectedYear(selectedYear + 1);
                          } else {
                            setSelectedMonth(selectedMonth + 1);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i} value={i}>
                            {new Date(2021, i).toLocaleDateString('ja-JP', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({length: 10}, (_, i) => (
                          <option key={i} value={2020 + i}>
                            {2020 + i}年
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="p-4 text-center">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">{day}</div>
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="relative">
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-50 last:border-b-0">
                  {week.map((dayData, dayIndex) => {
                    const isWeekend = dayIndex >= 5;
                    const isActive = dayData.active;
                    const isEmpty = dayData.isEmpty;
                    const isToday = dayData.isToday;
                    
                    if (isEmpty) {
                      return (
                        <div 
                          key={`empty-${weekIndex}-${dayIndex}`}
                          className="min-h-32 border-r border-gray-50 last:border-r-0 p-3 bg-gray-50/30 cursor-pointer"
                          onClick={() => setExpandedDays({})}
                        />
                      );
                    }
                    
                    const dateStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${dayData.day.toString().padStart(2, '0')}`;
                    
                    return (
                      <div 
                        key={dayData.day} 
                        className={`min-h-32 border-r border-gray-50 last:border-r-0 p-3 ${
                          isWeekend ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/30'
                        } ${isActive ? 'bg-blue-50' : ''} cursor-pointer transition-colors relative`}
                        onClick={() => {
                          if (!isWeekend) {
                            // Close all other expanded days and toggle current day
                            const newExpandedDays = {};
                            if (!expandedDays[dateStr]) {
                              newExpandedDays[dateStr] = true;
                            }
                            setExpandedDays(newExpandedDays);
                          }
                        }}
                      >
                        {isToday && (
                          <div className="absolute inset-0 bg-green-200/30 border border-green-400 pointer-events-none rounded-md"></div>
                        )}
                        <div className={`text-sm font-normal mb-2 ${
                          isToday ? 'text-green-600 font-semibold' :
                          isActive ? 'text-blue-600' : 
                          isWeekend ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {dayData.day.toString().padStart(2, '0')}
                        </div>
                        
                        <div className="space-y-1">
                          {dayData.events?.map((event, eventIndex) => (
                            <div 
                              key={eventIndex}
                              className={`text-xs p-2 rounded-md ${
                                event.type === 'interview' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                event.type === 'task' && event.classification === '面談' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                event.type === 'task' && event.classification === '提出物' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                event.type === 'task' && event.classification === 'イベント' ? 'bg-green-100 text-green-700 border border-green-200' :
                                event.type === 'task' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                event.title.includes('Breakfast') ? 'bg-purple-100 text-purple-700' :
                                event.title.includes('Lunch') ? 'bg-green-100 text-green-700' :
                                event.title.includes('Team') ? 'bg-blue-100 text-blue-700' :
                                event.title.includes('Meeting') ? 'bg-orange-100 text-orange-700' :
                                event.title.includes('Holiday') ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-normal text-xs">{event.title}</div>
                                <div className="text-xs opacity-75">{event.time}</div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Time Selection Bars - Show when day is expanded */}
                          {expandedDays[dateStr] && !isWeekend && (
                            <div className="mt-2 space-y-1">
                              {generateTimeSlots().map(time => {
                                const isReserved = isSlotReserved(dateStr, time);
                                return (
                                  <button
                                    key={time}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isReserved) {
                                        setSelectedSlot({ date: dateStr, time });
                                        setExpandedDays({});
                                        setShowReservationModal(true);
                                      }
                                    }}
                                    disabled={isReserved}
                                    className={`w-full p-1 text-xs font-medium rounded transition-all ${
                                      isReserved 
                                        ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-60' 
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'
                                    }`}
                                  >
                                    {time}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Vertical Color Bar */}
              <div className="absolute right-0 top-0 bottom-0 w-1">
                <div className="h-1/4 bg-blue-500"></div>
                <div className="h-1/4 bg-purple-500"></div>
                <div className="h-1/4 bg-green-500"></div>
                <div className="h-1/4 bg-orange-500"></div>
              </div>
            </div>
            
            {/* Task Categories Legend - Integrated into calendar */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></div>
                  <span className="text-xs font-medium text-gray-600">面談</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-1.5"></div>
                  <span className="text-xs font-medium text-gray-600">提出物</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                  <span className="text-xs font-medium text-gray-600">イベント</span>
                </div>
              </div>
            </div>

            {/* Mobile Tab Navigation - Inside Calendar */}
            <div className="lg:hidden border-t border-gray-200">
              {/* Tab Headers */}
              <div className="flex bg-white">
                <button
                  onClick={() => setActiveMobileTab('events')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeMobileTab === 'events'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Upcoming Events
                </button>
                <button
                  onClick={() => setActiveMobileTab('tasks')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeMobileTab === 'tasks'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Task List
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 bg-white">
                {activeMobileTab === 'events' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Upcoming events</h3>
                      <p className="text-xs text-gray-500 mb-4">今週の予定 ({(() => {
                        const now = new Date();
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const todayDayOfWeek = today.getDay();
                        const startOfWeek = new Date(today);
                        const daysFromMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
                        startOfWeek.setDate(today.getDate() - daysFromMonday);
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        return `${startOfWeek.getDate()}日-${endOfWeek.getDate()}日`;
                      })()})</p>
                    </div>
                    <div className="space-y-4">
                      {(() => {
                        const now = new Date();
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const todayDayOfWeek = today.getDay();
                        const startOfWeek = new Date(today);
                        const daysFromMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
                        startOfWeek.setDate(today.getDate() - daysFromMonday);
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        
                        const weekEvents = [];
                        
                        reservations.forEach(reservation => {
                          const reservationDate = new Date(reservation.date);
                          if (reservationDate >= startOfWeek && reservationDate <= endOfWeek) {
                            weekEvents.push({
                              date: reservationDate,
                              time: reservation.time,
                              title: '面談',
                              type: 'reservation'
                            });
                          }
                        });
                        
                        tasks.forEach(task => {
                          const taskDate = new Date(task.due_date);
                          if (taskDate >= startOfWeek && taskDate <= endOfWeek) {
                            weekEvents.push({
                              date: taskDate,
                              time: '',
                              title: task.title,
                              type: 'task',
                              classification: task.classification
                            });
                          }
                        });
                        
                        weekEvents.sort((a, b) => {
                          if (a.date.getTime() !== b.date.getTime()) {
                            return a.date.getTime() - b.date.getTime();
                          }
                          return a.time.localeCompare(b.time);
                        });
                        
                        return weekEvents.map((event, index) => {
                          const isPast = event.date < today;
                          return (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="text-xs font-bold text-gray-900 w-12">
                                {event.date.getDate()}日
                                {event.time && <div>{event.time}</div>}
                              </div>
                              <div className="flex-1">
                                <div className={`text-sm ${isPast ? 'line-through text-gray-400' : ''} ${
                                  event.type === 'reservation' ? 'text-blue-700' :
                                  event.classification === '提出物' ? 'text-orange-700' :
                                  event.classification === 'イベント' ? 'text-green-700' :
                                  'text-gray-900'
                                }`}>
                                  {event.title}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {activeMobileTab === 'tasks' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Task List</h3>
                    <div className="space-y-3">
                      {(() => {
                        const monthTasks = tasks.filter(task => {
                          const taskDate = new Date(task.due_date);
                          return taskDate.getMonth() === selectedMonth && taskDate.getFullYear() === selectedYear;
                        });
                        
                        const monthReservations = reservations.filter(reservation => {
                          const reservationDate = new Date(reservation.date);
                          return reservationDate.getMonth() === selectedMonth && reservationDate.getFullYear() === selectedYear;
                        }).map(reservation => ({
                          id: `reservation-${reservation.id}`,
                          title: `面談: ${reservation.time}`,
                          due_date: reservation.date,
                          classification: '面談',
                          description: reservation.reservationName || reservation.employee_name,
                          type: 'reservation'
                        }));
                        
                        const allItems = [...monthTasks, ...monthReservations].sort((a, b) => {
                          const aIsPast = new Date(a.due_date) < new Date();
                          const bIsPast = new Date(b.due_date) < new Date();
                          
                          if (aIsPast !== bIsPast) {
                            return aIsPast ? 1 : -1;
                          }
                          
                          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                        });
                        
                        return allItems;
                      })().map((item, index) => {
                        const isPast = new Date(item.due_date) < new Date();
                        return (
                          <div key={item.id} className={`relative p-2 border rounded-lg ${
                            isPast ? 'bg-gray-200/70 border-gray-300 opacity-50' : 'bg-white/50 border-gray-200'
                          }`}>
                            <div className={`absolute top-2 left-1 w-3 h-3 rounded-full ${
                              item.classification === '面談' ? 'bg-blue-500' :
                              item.classification === '提出物' ? 'bg-orange-500' :
                              item.classification === 'イベント' ? 'bg-green-500' :
                              'bg-purple-500'
                            }`} />
                            <div className="ml-5">
                              <div className={`text-xs font-medium ${
                                isPast ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {item.title}
                              </div>
                              <div className={`text-xs ${
                                isPast ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                〆 {new Date(item.due_date).toLocaleDateString('ja-JP')}
                              </div>
                              {item.description && (
                                <div className={`text-xs mt-1 ${
                                  isPast ? 'text-gray-400' : 'text-gray-400'
                                }`}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>





        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block w-80 p-6 space-y-6">

          {/* Upcoming Events */}
          <div className="bg-white/90 rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Upcoming events</h3>
            <p className="text-xs text-gray-500 mb-4">今週の予定 ({(() => {
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const todayDayOfWeek = today.getDay();
              const startOfWeek = new Date(today);
              const daysFromMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
              startOfWeek.setDate(today.getDate() - daysFromMonday);
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              return `${startOfWeek.getDate()}日-${endOfWeek.getDate()}日`;
            })()})</p>
            <div className="space-y-4">
              {(() => {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // JST midnight
                const todayDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                const startOfWeek = new Date(today);
                const daysFromMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // Sunday = 0, so 6 days back to Monday
                startOfWeek.setDate(today.getDate() - daysFromMonday); // Monday
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
                
                const weekEvents = [];
                
                // Add reservations for this week
                reservations.forEach(reservation => {
                  const reservationDate = new Date(reservation.date);
                  if (reservationDate >= startOfWeek && reservationDate <= endOfWeek) {
                    weekEvents.push({
                      date: reservationDate,
                      time: reservation.time,
                      title: '面談',
                      type: 'reservation'
                    });
                  }
                });
                
                // Add tasks due this week
                tasks.forEach(task => {
                  const taskDate = new Date(task.due_date);
                  if (taskDate >= startOfWeek && taskDate <= endOfWeek) {
                    weekEvents.push({
                      date: taskDate,
                      time: '',
                      title: task.title,
                      type: 'task',
                      classification: task.classification
                    });
                  }
                });
                
                // Sort by date and time
                weekEvents.sort((a, b) => {
                  if (a.date.getTime() !== b.date.getTime()) {
                    return a.date.getTime() - b.date.getTime();
                  }
                  return a.time.localeCompare(b.time);
                });
                
                return weekEvents.map((event, index) => {
                  const isPast = event.date < today;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-xs font-bold text-gray-900 w-12">
                        {event.date.getDate()}日
                        {event.time && <div>{event.time}</div>}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${isPast ? 'line-through text-gray-400' : ''} ${
                          event.type === 'reservation' ? 'text-blue-700' :
                          event.classification === '提出物' ? 'text-orange-700' :
                          event.classification === 'イベント' ? 'text-green-700' :
                          'text-gray-900'
                        }`}>
                          {event.title}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Task List */}
          <div className="bg-white/90 rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Task List</h3>
            <div className="space-y-3">
              {(() => {
                // Filter tasks for selected month
                const monthTasks = tasks.filter(task => {
                  const taskDate = new Date(task.due_date);
                  return taskDate.getMonth() === selectedMonth && taskDate.getFullYear() === selectedYear;
                });
                
                // Filter reservations for selected month and convert to task-like format
                const monthReservations = reservations.filter(reservation => {
                  const reservationDate = new Date(reservation.date);
                  return reservationDate.getMonth() === selectedMonth && reservationDate.getFullYear() === selectedYear;
                }).map(reservation => ({
                  id: `reservation-${reservation.id}`,
                  title: `面談: ${reservation.time}`,
                  due_date: reservation.date,
                  classification: '面談',
                  description: reservation.reservationName || reservation.employee_name,
                  type: 'reservation'
                }));
                
                // Combine and sort by completion status first, then by date
                const allItems = [...monthTasks, ...monthReservations].sort((a, b) => {
                  const aIsPast = new Date(a.due_date) < new Date();
                  const bIsPast = new Date(b.due_date) < new Date();
                  
                  // Sort by past status first (not past items first)
                  if (aIsPast !== bIsPast) {
                    return aIsPast ? 1 : -1;
                  }
                  
                  // Then sort by date
                  return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                });
                
                return allItems;
              })().map((item, index) => {
                const isPast = new Date(item.due_date) < new Date();
                return (
                <div key={item.id} className={`relative p-2 border rounded-lg ${
                  isPast ? 'bg-gray-200/70 border-gray-300 opacity-50' : 'bg-white/50 border-gray-200'
                }`}>
                  <div className={`absolute top-2 left-1 w-3 h-3 rounded-full ${
                    item.classification === '面談' ? 'bg-blue-500' :
                    item.classification === '提出物' ? 'bg-orange-500' :
                    item.classification === 'イベント' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="ml-5">
                    <div className={`text-xs font-medium ${
                      isPast ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </div>
                    <div className={`text-xs ${
                      isPast ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      〆 {new Date(item.due_date).toLocaleDateString('ja-JP')}
                    </div>
                    {item.description && (
                      <div className={`text-xs mt-1 ${
                        isPast ? 'text-gray-400' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

        </div>
        </>
      )}

      {/* 面談予約編集ページ */}
      {currentPage === 'reservations' && (
        <div className="flex-1 p-8 relative">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">面談予約管理</h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">従業員</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メール</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">****</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">****@****</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900">削除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 認証オーバーレイ */}
          {!isPageAuthenticated('reservations') && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-30 overflow-hidden">
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg w-96 max-w-full mx-4 border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" fill="white" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">面談予約管理</h1>
                  <p className="text-gray-500">パスワードを入力してください</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="パスワードを入力"
                    />
                  </div>
                  <button
                    onClick={() => handleLogin()}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ログイン
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* タスク編集ページ */}
      {currentPage === 'tasks' && (
        <div className="flex-1 p-8 relative">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
              <button 
                onClick={() => openTaskModal('add')}
                className="bg-blue-600 text-white w-10 h-10 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {/* フィルターとソート */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">年月:</label>
                <select
                  value={taskFilterYear}
                  onChange={(e) => setTaskFilterYear(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                >
                  {Array.from({length: 5}, (_, i) => (
                    <option key={i} value={currentDate.getFullYear() - 2 + i}>
                      {currentDate.getFullYear() - 2 + i}年
                    </option>
                  ))}
                </select>
                <select
                  value={taskFilterMonth}
                  onChange={(e) => setTaskFilterMonth(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={-1}>全月</option>
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(2021, i).toLocaleDateString('ja-JP', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">ソート:</label>
                <select
                  value={taskSortBy}
                  onChange={(e) => setTaskSortBy(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="date">日付順</option>
                  <option value="classification">分類順</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid gap-4">
              {(() => {
                // フィルタリング
                let filteredTasks = tasks.filter(task => {
                  const taskDate = new Date(task.due_date);
                  const yearMatch = taskDate.getFullYear() === taskFilterYear;
                  const monthMatch = taskFilterMonth === -1 || taskDate.getMonth() === taskFilterMonth;
                  return yearMatch && monthMatch;
                });
                
                // ソート
                filteredTasks.sort((a, b) => {
                  if (taskSortBy === 'date') {
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                  } else if (taskSortBy === 'classification') {
                    const classOrder = {'面談': 0, '提出物': 1, 'イベント': 2};
                    const aOrder = classOrder[a.classification] || 999;
                    const bOrder = classOrder[b.classification] || 999;
                    if (aOrder !== bOrder) return aOrder - bOrder;
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                  }
                  return 0;
                });
                
                return filteredTasks;
              })().map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.classification === '面談' ? 'bg-blue-100 text-blue-700' :
                          task.classification === '提出物' ? 'bg-orange-100 text-orange-700' :
                          task.classification === 'イベント' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {task.classification}
                        </span>
                        <span className="text-sm text-gray-500">期限: {new Date(task.due_date).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openTaskModal('edit', task)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        編集
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 認証オーバーレイ */}
          {!isPageAuthenticated('tasks') && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-30 overflow-hidden">
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg w-96 max-w-full mx-4 border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" fill="white" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">タスク管理</h1>
                  <p className="text-gray-500">パスワードを入力してください</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="パスワードを入力"
                    />
                  </div>
                  <button
                    onClick={() => handleLogin()}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ログイン
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ステークホルダー編集ページ */}
      {currentPage === 'stakeholders' && (
        <div className="flex-1 p-8 relative">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ステークホルダー管理</h1>
            <button 
              onClick={() => openStakeholderModal('add')}
              className="bg-blue-600 text-white w-10 h-10 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* アクティブなステークホルダー */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                アクティブなステークホルダー
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.filter(emp => emp.active).map((employee) => (
                <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                        employee.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {employee.active ? 'アクティブ' : '非アクティブ'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => openStakeholderModal('edit', employee)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        編集
                      </button>
                      <button 
                        onClick={() => handleDeleteStakeholder(employee.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 非アクティブなステークホルダー */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                非アクティブなステークホルダー
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.filter(emp => !emp.active).length > 0 ? (
                  employees.filter(emp => !emp.active).map((employee) => (
                    <div key={employee.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50 opacity-75">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-700">{employee.name}</h3>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                          <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                            非アクティブ
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => openStakeholderModal('edit', employee)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            編集
                          </button>
                          <button 
                            onClick={() => handleDeleteStakeholder(employee.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-3">非アクティブなステークホルダーはありません</p>
                )}
              </div>
            </div>
          </div>
          
          {/* 認証オーバーレイ */}
          {!isPageAuthenticated('stakeholders') && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-30 overflow-hidden">
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg w-96 max-w-full mx-4 border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" fill="white" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">ステークホルダー管理</h1>
                  <p className="text-gray-500">パスワードを入力してください</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="パスワードを入力"
                    />
                  </div>
                  <button
                    onClick={() => handleLogin()}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ログイン
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>

    {/* Reservation Modal */}
    {showReservationModal && (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden"
      >
        <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">新しい予約</h3>
            <button 
              onClick={() => {
                setShowReservationModal(false);
                setSelectedSlot(null);
                setSelectedEmployee('');
                setEmployeeEmail('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {selectedSlot && (
            <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
              📅 {selectedSlot.date} {selectedSlot.time}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">従業員選択</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
              <input
                type="email"
                placeholder="example@company.com"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleReservation}
                disabled={loading || !selectedSlot}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '予約中...' : '予約する'}
              </button>
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  setSelectedSlot(null);
                  setSelectedEmployee('');
                  setEmployeeEmail('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Task Modal */}
    {showTaskModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-medium mb-4">
            {taskModalMode === 'add' ? 'タスクを追加' : 'タスクを編集'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="タスクのタイトルを入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="タスクの説明を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分類
              </label>
              <select
                value={taskFormData.classification}
                onChange={(e) => setTaskFormData({...taskFormData, classification: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="面談">面談</option>
                <option value="提出物">提出物</option>
                <option value="イベント">イベント</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期限日
              </label>
              <input
                type="date"
                value={taskFormData.due_date}
                onChange={(e) => setTaskFormData({...taskFormData, due_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => taskModalMode === 'add' ? handleCreateTask() : handleUpdateTask()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {taskModalMode === 'add' ? '追加' : '更新'}
            </button>
            <button
              onClick={() => {
                setShowTaskModal(false);
                setTaskFormData({ title: '', description: '', classification: '面談', due_date: '' });
                setSelectedTask(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Stakeholder Modal */}
    {showStakeholderModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-medium mb-4">
            {stakeholderModalMode === 'add' ? 'ステークホルダーを追加' : 'ステークホルダーを編集'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名前
              </label>
              <input
                type="text"
                value={stakeholderFormData.name}
                onChange={(e) => setStakeholderFormData({...stakeholderFormData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ステークホルダーの名前を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={stakeholderFormData.email}
                onChange={(e) => setStakeholderFormData({...stakeholderFormData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="example@company.com"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={stakeholderFormData.active}
                onChange={(e) => setStakeholderFormData({...stakeholderFormData, active: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                アクティブ
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => stakeholderModalMode === 'add' ? handleCreateStakeholder() : handleUpdateStakeholder()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {stakeholderModalMode === 'add' ? '追加' : '更新'}
            </button>
            <button
              onClick={() => {
                setShowStakeholderModal(false);
                setStakeholderFormData({ name: '', email: '', active: true });
                setSelectedStakeholder(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}