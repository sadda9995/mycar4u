import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`,
    withCredentials: true
});

// Add a request interceptor to attach the token
// Note: In Next.js SSR, localStorage isn't available on the server.
// This works for client-side requests.
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        if (isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            }).then(() => api(originalRequest)).catch(err => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
            await api.post('/auth/refresh');
            processQueue(null);
            return api(originalRequest);
        } catch (err) {
            processQueue(err, null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
});

export default api;
