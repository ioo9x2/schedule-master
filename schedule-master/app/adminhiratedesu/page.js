'use client';

import { useState, useEffect } from 'react';
import PasswordProtection from '../../components/PasswordProtection';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      // Get all employees (not just active ones) for admin
      const allEmployeesResponse = await fetch('/api/employees/all');
      const allData = allEmployeesResponse.ok ? await allEmployeesResponse.json() : data;
      setEmployees(allData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('従業員の取得に失敗しました');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('名前とメールアドレスを入力してください');
      return;
    }

    setLoading(true);
    try {
      const method = editingEmployee ? 'PUT' : 'POST';
      const body = editingEmployee 
        ? { ...formData, id: editingEmployee.id }
        : formData;

      const response = await fetch('/api/employees', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(editingEmployee ? '従業員を更新しました' : '従業員を追加しました');
        setFormData({ name: '', email: '' });
        setShowAddForm(false);
        setEditingEmployee(null);
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '操作に失敗しました');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('操作に失敗しました');
    }
    setLoading(false);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email
    });
    setShowAddForm(true);
  };

  const handleToggleActive = async (employee) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: employee.id,
          active: !employee.active
        }),
      });

      if (response.ok) {
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '更新に失敗しました');
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      alert('更新に失敗しました');
    }
  };

  const handleDelete = async (employee) => {
    if (!confirm(`${employee.name}を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/employees?id=${employee.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('従業員を削除しました');
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('削除に失敗しました');
    }
  };

  const cancelEdit = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '' });
    setShowAddForm(false);
  };

  return (
    <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">
              従業員マスター管理
            </h1>
            <p className="text-lg text-gray-600">
              従業員の追加・編集・削除を行います
            </p>
          </div>

          {/* Add Employee Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>新規追加</span>
              </div>
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600">
                <h2 className="text-xl font-medium text-white">
                  {editingEmployee ? '従業員編集' : '新規従業員追加'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">お名前 *</label>
                    <input
                      type="text"
                      placeholder="田中 太郎"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">メールアドレス *</label>
                    <input
                      type="email"
                      placeholder="tanaka@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>処理中...</span>
                      </div>
                    ) : (
                      <span>{editingEmployee ? '更新' : '追加'}</span>
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

          {/* Employee List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600">
              <h2 className="text-xl font-medium text-white">従業員一覧</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">名前</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">メールアドレス</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">状態</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{employee.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          employee.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.active ? '有効' : '無効'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="編集"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleActive(employee)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              employee.active 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={employee.active ? '無効化' : '有効化'}
                          >
                            {employee.active ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(employee)}
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
              {employees.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  従業員が登録されていません
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