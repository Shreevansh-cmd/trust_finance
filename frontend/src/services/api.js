import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password, role) => api.post('/login', { email, password, role }).then(r => r.data);

export const getDashboard = (userId) => api.get(`/dashboard/${userId}`);

export const applyLoan = (userId, amount, purpose) => api.post(`/apply-loan/${userId}`, { amount, purpose });

export const updateFinancials = (userId, data) => api.post(`/update-financials/${userId}`, data);

export const resetFinancials = (userId) => api.post(`/reset-financials/${userId}`);

export const getAdminUsers = () => api.get('/admin/users');

// Aliases used by Dashboard.jsx and Admin.jsx
export const getUserDashboard = (userId) => getDashboard(userId).then(r => r.data);
export const getAllUsers = () => getAdminUsers().then(r => r.data.users);

export const simulateRiskEvent = (userId) => 
  api.get(`/risk-alert/${userId}`).then(r => r.data);

export default api;
