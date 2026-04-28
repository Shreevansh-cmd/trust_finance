import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = (username) => api.post('/login', { username });

export const getDashboard = (userId) => api.get(`/dashboard/${userId}`);

export const applyLoan = (userId) => api.post('/apply-loan', { user_id: userId });

export const updateFinancials = (userId, data) => api.post(`/update-financials/${userId}`, data);

export const getAdminUsers = () => api.get('/admin/users');

// Aliases used by Dashboard.jsx and Admin.jsx
export const getUserDashboard = (userId) => getDashboard(userId).then(r => r.data);
export const getAllUsers = () => getAdminUsers().then(r => r.data.users);

export const simulateRiskEvent = (userId, prevData, currData) => 
  api.post('/risk-alert', { user_id: userId, prev_data: prevData, curr_data: currData });

export default api;
