import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔥 INTERCEPTOR DE TOKEN
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const accountsAPI = {
  getAll: () => API.get('/accounts'),
};

export const transactionsAPI = {
  getAllHistory: () => API.get('/transactions/history'),
  create: (data) => API.post('/transactions', data),
  exportCSV: () => API.get('/transactions/export', { responseType: 'blob' }),
  getReceipt: (id) => API.get(`/transactions/${id}/receipt`, { responseType: 'blob' }),
  payTax: (id, data) => API.post(`/transactions/${id}/pay-tax`, data),
};

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

export default API;
