'use client';

import { useState, useEffect } from 'react';
import PasswordProtection from '../../components/PasswordProtection';

export default function ReservationsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    employeeName: '',
    employeeEmail: ''
  });
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReservations();
    fetchEmployees();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      const data = await response.json();
      // Sort by date and time
      const sortedData = data.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA - dateTimeB;
      });
      setReservations(sortedData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      alert('予約の取得に失敗しました');
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

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setFormData({
      date: reservation.date,
      time: reservation.time,
      employeeName: reservation.employee_name,
      employeeEmail: reservation.employee_email
    });
    setShowEditForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.employeeName || !formData.employeeEmail) {
      alert('すべての項目を入力してください');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.employeeEmail)) {
      alert('有効なメールアドレスを入力してください');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingReservation.id,
          date: formData.date,
          time: formData.time,
          reservationName: formData.employeeName,
          employeeEmail: formData.employeeEmail
        }),
      });

      if (response.ok) {
        alert('予約を更新しました');
        setFormData({ date: '', time: '', employeeName: '', employeeEmail: '' });
        setShowEditForm(false);
        setEditingReservation(null);
        fetchReservations();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('更新に失敗しました');
    }
    setLoading(false);
  };

  const handleDelete = async (reservation) => {
    if (!confirm(`${reservation.employee_name}の${reservation.date} ${reservation.time}の予約を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations?id=${reservation.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('予約を削除しました');
        fetchReservations();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('削除に失敗しました');
    }
  };

  const cancelEdit = () => {
    setEditingReservation(null);
    setFormData({ date: '', time: '', employeeName: '', employeeEmail: '' });
    setShowEditForm(false);
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    })} ${time}`;
  };

  const filteredReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.date);
    return reservationDate.getFullYear() === filterYear && 
           reservationDate.getMonth() === filterMonth;
  });

  const timeSlots = generateTimeSlots();

  return (
    <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h9a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">
              予約状況管理
            </h1>
            <p className="text-lg text-gray-600">
              予約の確認・編集・削除を行います
            </p>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600">
              <h2 className="text-xl font-medium text-white mb-4">表示フィルター</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select 
                    value={filterYear} 
                    onChange={(e) => setFilterYear(parseInt(e.target.value))}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <div className="text-white">
                  <span className="text-sm">予約件数: {filteredReservations.length}件</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {showEditForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-xl font-medium text-white">予約編集</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">日付 *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">時間 *</label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">時間を選択</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">従業員名 *</label>
                    <input
                      type="text"
                      placeholder="従業員名"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">メールアドレス *</label>
                    <input
                      type="email"
                      placeholder="example@company.com"
                      value={formData.employeeEmail}
                      onChange={(e) => setFormData({ ...formData, employeeEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>更新中...</span>
                      </div>
                    ) : (
                      <span>更新</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reservations List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600">
              <h2 className="text-xl font-medium text-white">予約一覧</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">日時</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">従業員名</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">メールアドレス</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">作成日時</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatDateTime(reservation.date, reservation.time)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{reservation.employee_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{reservation.employee_email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(reservation.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(reservation)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="編集"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(reservation)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredReservations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  選択された期間に予約がありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </PasswordProtection>
  );
}