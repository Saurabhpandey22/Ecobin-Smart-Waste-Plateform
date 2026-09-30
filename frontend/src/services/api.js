/**
 * Ecobin API Service & Real-Time Socket Connection
 */

import { io } from 'socket.io-client';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true
});

let authToken = localStorage.getItem('ecobin_token') || null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('ecobin_token', token);
  } else {
    localStorage.removeItem('ecobin_token');
  }
};

export const getAuthToken = () => authToken;

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('Unauthorized token request - session expired');
    }
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  verifyOtp: (payload) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  demoSwitchRole: (role) => request('/auth/demo-switch', { method: 'POST', body: JSON.stringify({ role }) }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Complaints
  createComplaint: (payload) => request('/complaints', { method: 'POST', body: JSON.stringify(payload) }),
  getComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/complaints?${query}`);
  },
  getComplaintById: (id) => request(`/complaints/${id}`),
  updateComplaintStatus: (id, payload) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  assignComplaintStaff: (id, staff_id) => request(`/complaints/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ staff_id }) }),
  getHeatmapData: () => request('/complaints/heatmap'),

  // Pickups
  createPickup: (payload) => request('/pickups', { method: 'POST', body: JSON.stringify(payload) }),
  getPickups: () => request('/pickups'),
  updatePickupStatus: (id, payload) => request(`/pickups/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Bins
  getBins: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bins?${query}`);
  },
  getBinById: (id) => request(`/bins/${id}`),
  updateThreshold: (id, threshold_value) => request(`/bins/${id}/threshold`, { method: 'PATCH', body: JSON.stringify({ threshold_value }) }),
  triggerDump: (id, addedFill = 35) => request(`/bins/${id}/trigger-dump`, { method: 'POST', body: JSON.stringify({ addedFill }) }),
  emptyBin: (id) => request(`/bins/${id}/empty`, { method: 'POST' }),
  toggleSimulator: () => request('/bins/toggle-simulator', { method: 'POST' }),

  // Admin
  getSummaryStats: () => request('/admin/summary-stats'),
  getRouteOptimization: (staffId) => request(`/admin/route-optimization?staffId=${staffId || ''}`),
  getSustainabilityReport: () => request('/admin/sustainability-report'),
  getUsersList: () => request('/admin/users'),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  grantAdminAccess: (email, role = 'admin') => request('/admin/users/grant-access', { method: 'POST', body: JSON.stringify({ email, role }) }),

  // Eco
  getEcoSummary: () => request('/eco/summary'),
  submitQuiz: (payload) => request('/eco/quiz-submit', { method: 'POST', body: JSON.stringify(payload) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),

  // AI Classifier & Chat
  classifyWaste: (payload) => request('/ai/classify-waste', { method: 'POST', body: JSON.stringify(payload) }),
  sendAIChat: (payload) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),

  // File Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'File upload failed');
    return data;
  }
};
