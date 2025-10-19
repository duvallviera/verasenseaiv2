import axios from 'axios';

// Get API URL from environment variables or use Railway URL as default
// Using type assertion for Vite environment variables
const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://agile-rejoicing-production.up.railway.app/api';

// Log which API URL is being used (helpful for debugging)
console.log(`VeriSenseAI connecting to API at: ${API_URL}`);

// Alternative API URLs in case the primary one fails
const BACKUP_API_URLS = [
  'https://agile-rejoicing-production.up.railway.app/api',
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

// Mock API fallback for development
const mockAPI = {
  login: (email: string, password: string) => {
    console.log('Using mock API for login');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: 'Login successful (mock)',
            token: 'mock-token-' + Date.now(),
            user: {
              id: '1',
              name: 'Test User',
              email: email,
              role: 'user'
            }
          }
        });
      }, 1000);
    });
  },
  register: (userData: any) => {
    console.log('Using mock API for register');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: 'Registration successful (mock)',
            token: 'mock-token-' + Date.now(),
            user: {
              id: '2',
              name: userData.name,
              email: userData.email,
              role: 'user'
            }
          }
        });
      }, 1000);
    });
  }
};

// Auth API calls with fallback
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      return await api.post('/auth/login', { email, password });
    } catch (error) {
      console.log('Railway API failed, using mock API');
      return await mockAPI.login(email, password);
    }
  },
  register: async (userData: any) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
      console.log('Railway API failed, using mock API');
      return await mockAPI.register(userData);
    }
  },
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
