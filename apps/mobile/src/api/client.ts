import axios from 'axios';

import { useAuthStore } from '../state/auth';
import { APP_ENV } from '../config/appEnv';

declare const process: {
  env?: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

const api = axios.create({
  baseURL: process.env?.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Env': APP_ENV,
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEconomyMe = () => api.get('/economy/me');
export const getInventoryMe = () => api.get('/inventory/me');
export const getEntitlements = () => api.get('/entitlements/me');
export const postEventLog = (payload: { eventType: string; metadata?: Record<string, unknown> }) =>
  api.post('/events/log', payload);

export default api;
