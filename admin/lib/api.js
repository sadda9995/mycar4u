import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let queue = [];

const flushQueue = (error) => {
    queue.forEach(({ reject, resolve }) => (error ? reject(error) : resolve()));
    queue = [];
};

api.interceptors.response.use((res) => res, async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
        // If another request is already refreshing, queue this one
        if (isRefreshing) {
            return new Promise((resolve, reject) => queue.push({ resolve, reject }))
                .then(() => api(original))
                .catch(err => Promise.reject(err));
        }

        original._retry = true;
        isRefreshing = true;
        try {
            const refreshRes = await api.post('/auth/refresh');
            const newToken = refreshRes?.data?.token || refreshRes?.data?.accessToken;

            if (newToken) {
                // Persist the new token and update default headers
                if (typeof window !== 'undefined') localStorage.setItem('token', newToken);
                api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                // Ensure the retried request uses the fresh token even before interceptors run again
                original.headers.Authorization = `Bearer ${newToken}`;
            } else {
                throw new Error('No token returned from refresh');
            }

            flushQueue(null);
            return api(original);
        } catch (err) {
            flushQueue(err);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
});

export default api;
