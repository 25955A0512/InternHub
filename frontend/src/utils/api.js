import axios from 'axios';

// Base URL of our backend
const API = axios.create({
  baseURL: 'https://internhub-huj2.onrender.com/api'
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Interns
export const createInternProfile = (data) => API.post('/interns/profile', data);
export const getMyInternProfile = () => API.get('/interns/me');
export const getAllInterns = () => API.get('/interns');
export const updateInternStatus = (id, data) => API.put(`/interns/${id}/status`, data);
export const assignMentor = (id, data) => API.put(`/interns/${id}/mentor`, data);

// Mentors
export const createMentorProfile = (data) => API.post('/mentors/profile', data);
export const getAllMentors = () => API.get('/mentors');

// Tasks
export const createTask = (data) => API.post('/tasks', data);
export const getMyTasksAsMentor = () => API.get('/tasks/my-tasks');
export const getMyTasksAsIntern = () => API.get('/tasks/intern-tasks');
export const submitTask = (id) => API.put(`/tasks/${id}/submit`);
export const updateTaskStatus = (id, data) => API.put(`/tasks/${id}/status`, data);

// Attendance
export const checkIn = (data) => API.post('/attendance/checkin', data);
export const checkOut = () => API.post('/attendance/checkout');
export const getMyAttendance = () => API.get('/attendance/my');
export const getMyReport = () => API.get('/attendance/my/report');

// Evaluations
export const createEvaluation = (data) => API.post('/evaluations', data);
export const getMyEvaluations = () => API.get('/evaluations/my');

// Certificates
export const getMyCertificate = () => API.get('/certificates/my');
export const generateCertificate = (data) => API.post('/certificates/generate', data);


// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read/all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

export const getLeaderboard = () => API.get('/evaluations/leaderboard');

export default API;
