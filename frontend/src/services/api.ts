import axios from 'axios';

// Get API URL from environment variables or use Railway URL as default
// Using type assertion for Vite environment variables
const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://your-railway-app.railway.app/api';

// Log which API URL is being used (helpful for debugging)
console.log(`VeriSenseAI connecting to API at: ${API_URL}`);

// Alternative API URLs in case the primary one fails
const BACKUP_API_URLS = [
  'https://your-railway-app.railway.app/api',
  'http://localhost:3001/api' // Local development fallback
];

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds to account for potential mobile network latency
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    // Handle 401 Unauthorized - redirect to login
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (userData: any) => 
    api.post('/auth/register', userData),
  me: () => 
    api.get('/auth/me'),
  faceLogin: (faceImage: string) => {
    console.log('API service: sending face login request with image data length:', faceImage.length);
    return api.post('/auth/face-login', { faceImage });
  },
  faceVerify: (faceImage: string) => 
    api.post('/auth/face-verify', { faceImage }),
};

// Session API calls
export const sessionAPI = {
  getSessions: () => 
    api.get('/sessions'),
  getSession: (sessionId: string) => 
    api.get(`/sessions/${sessionId}`),
  createSession: (sessionData: any) => 
    api.post('/sessions', sessionData),
  updateSession: (sessionId: string, sessionData: any) => 
    api.put(`/sessions/${sessionId}`, sessionData),
};

// Analysis API calls
export const analysisAPI = {
  analyzeSession: (sessionId: string) => 
    api.post(`/analysis/${sessionId}`),
  getSessionAnalysis: (sessionId: string) => 
    api.get(`/analysis/${sessionId}`),
};

export default api;
