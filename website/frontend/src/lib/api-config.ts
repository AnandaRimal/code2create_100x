import axios from 'axios';

// API Configuration - Updated to use unified backend on port 8000
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 10000,
} as const;

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/auth/business-login';
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/business/login',
    REGISTER: '/business/register',
    REFRESH: '/auth/refresh',
  },
  
  // Analytics
  ANALYTICS: {
    REVENUE: '/analytics/revenue',
    PRODUCTS: '/analytics/products', 
    FORECAST: '/analytics/forecast',
    SEASONAL: '/analytics/seasonal',
    RECOMMENDATIONS: '/analytics/recommendations',
    DASHBOARD_STATS: '/analytics/dashboard-stats',
  },
  
  // Subscriptions
  SUBSCRIPTIONS: {
    INFO: '/subscriptions/info',
    UPGRADE: '/subscriptions/upgrade',
    DOWNGRADE: '/subscriptions/downgrade',
  },
  
  // Health
  HEALTH: '/health',
} as const;
