import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const TOKEN_KEY = 'taskflow_token';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// Attach the saved JWT to every request.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Turns any axios error into a readable message. */
export function errorMessage(err: unknown): string {
  const e = err as any;
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.code === 'ECONNABORTED' || e?.message === 'Network Error') {
    return 'Cannot reach the server. Check your connection and the API address.';
  }
  return 'Something went wrong. Please try again.';
}

export default api;
