import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getRooms = () => api.get('/rooms/');
export const createRoom = (name) => api.post('/rooms/', { name });
export const getMessages = (roomName) => api.get(`/messages/?room=${roomName}`);