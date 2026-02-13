import axios from 'axios';

// 1. Force use of Vite Proxy in Development, Env Var in Prod
// The proxy in vite.config.js will forward '/api' -> 'http://127.0.0.1:5000/api'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // 2. Timeout to fail fast if backend is dead (5 seconds)
    timeout: 5000
});

// 3. Robust Token Attachment
api.interceptors.request.use(
    (config) => {
        // Try multiple keys just in case
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug Log
        console.debug(`[API Req] ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// 4. Detailed Error Logging
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error(`Status: Timeout`);
            alert("Server is not responding. Is the Backend running?");
            return Promise.reject(error);
        }

        if (!error.response) {
            console.error(`Status: Network Error (CORS or Offline)`);
            console.warn(`Check if Backend is running at ${BASE_URL}`);
            return Promise.reject(error);
        }

        const { status, data } = error.response;
        console.error(`[API Error] ${status} - ${data?.msg || data?.error || 'Unknown'}`);

        if (status === 401) {
            console.warn("Unauthorized -> Logging out");
            localStorage.removeItem('token');
            const path = window.location.pathname;
            // Don't redirect if already public or login
            if (!path.includes('/admin/login') && !path.startsWith('/r/') && !path.startsWith('/restaurant/')) {
                window.location.href = '/admin/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
