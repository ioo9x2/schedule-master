'use client';

import { useState, useEffect } from 'react';

export default function Page() {
  const [reservations, setReservations] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employees, setEmployees] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
    fetchEmployees();
  }, []);

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
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
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

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getWeekdaysInMonth = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const weekdays = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        weekdays.push(day);
      }
    }
    
    return weekdays;
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
          employeeName: employee.name,
          employeeEmail: employeeEmail,
        }),
      });

      if (response.ok) {
        alert('予約が完了しました');
        setSelectedSlot(null);
        setSelectedEmployee('');
        setEmployeeEmail('');
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

  const timeSlots = generateTimeSlots();
  const weekdaysInMonth = getWeekdaysInMonth(selectedYear, selectedMonth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">
              面談スケジュール予約
            </h1>
            <p className="text-lg text-gray-600">
              月次面談の日程を予約してください（平日のみ）
            </p>
          </div>

          {/* Date Selector Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-xl font-medium text-white mb-4">日程選択</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i}>{i + 1}月</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {weekdaysInMonth.map((day) => {
                  const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const isExpanded = expandedDays[date];
                  const hasReservations = timeSlots.some(time => isSlotReserved(date, time));
                  
                  return (
                    <div key={day} className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm mb-2">
                          <span className="text-lg font-medium text-gray-900">{day}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          {new Date(selectedYear, selectedMonth, day).toLocaleDateString('ja-JP', { weekday: 'short' })}
                        </p>
                        <button
                          onClick={() => toggleDayExpansion(date)}
                          className="mt-2 w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <span>時間を選択</span>
                          <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {hasReservations && (
                          <div className="mt-1 flex justify-center">
                            <span className="inline-flex w-2 h-2 bg-red-400 rounded-full"></span>
                          </div>
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="space-y-2 mt-4">
                          {timeSlots.map(time => {
                            const isReserved = isSlotReserved(date, time);
                            const isSelected = selectedSlot?.date === date && selectedSlot?.time === time;
                            
                            return (
                              <button
                                key={time}
                                onClick={() => !isReserved && setSelectedSlot({ date, time })}
                                disabled={isReserved}
                                className={`w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                  isReserved 
                                    ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed opacity-60' 
                                    : isSelected
                                      ? 'bg-blue-600 text-white border border-blue-600 shadow-md transform scale-105'
                                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-center space-x-2">
                                  <span>{time}</span>
                                  {isReserved ? (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  ) : isSelected ? (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reservation Form */}
          {selectedSlot && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-green-600 to-emerald-600">
                <h2 className="text-xl font-medium text-white mb-2">予約情報の入力</h2>
                <p className="text-green-100">
                  選択日時: {new Date(selectedSlot.date).toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })} {selectedSlot.time}
                </p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">従業員選択 *</label>
                    <div className="relative">
                      <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">従業員を選択してください</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">メールアドレス *</label>
                    <input
                      type="email"
                      placeholder="example@company.com"
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleReservation}
                    disabled={loading}
                    className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>予約中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>予約する</span>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSlot(null);
                      setSelectedEmployee('');
                      setEmployeeEmail('');
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
