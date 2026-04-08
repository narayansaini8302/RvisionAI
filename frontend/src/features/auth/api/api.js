import axios from 'axios';

// Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        console.log('📤 Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            fullUrl: config.baseURL + config.url,
            hasToken: !!token
        });
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Token attached to request');
        } else {
            console.warn('⚠️ No token found in localStorage');
        }
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
    (response) => {
        console.log('📥 Response:', {
            url: response.config.url,
            status: response.status
        });
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            console.log('🔄 Unauthorized - clearing token and redirecting to login');
            localStorage.removeItem('token');
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;