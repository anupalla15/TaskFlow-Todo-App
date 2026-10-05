import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { TOKEN_KEY, errorMessage } from '../api/client';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  restoring: boolean; // true while we check AsyncStorage on app start
  error: string | null;
}

const initialState: AuthState = { user: null, token: null, loading: false, restoring: true, error: null };

type AuthResponse = { token: string; user: User };

const USER_KEY = 'taskflow_user';

/** Persists the session so the user stays logged in after restart. */
async function saveSession(data: AuthResponse) {
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export const register = createAsyncThunk<AuthResponse, { name: string; email: string; password: string }, { rejectValue: string }>(
  'auth/register',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', body);
      await saveSession(data);
      return data;
    } catch (e) { return rejectWithValue(errorMessage(e)); }
  },
);

export const login = createAsyncThunk<AuthResponse, { email: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', body);
      await saveSession(data);
      return data;
    } catch (e) { return rejectWithValue(errorMessage(e)); }
  },
);

/** Restores the session after the app restarts. */
export const restoreSession = createAsyncThunk('auth/restore', async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const user = await AsyncStorage.getItem(USER_KEY);
  return token && user ? ({ token, user: JSON.parse(user) } as AuthResponse) : null;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    const pending = (s: AuthState) => { s.loading = true; s.error = null; };
    const done = (s: AuthState, a: { payload: AuthResponse }) => {
      s.loading = false; s.token = a.payload.token; s.user = a.payload.user;
    };
    const failed = (s: AuthState, a: { payload?: string }) => { s.loading = false; s.error = a.payload ?? 'Failed'; };
    b.addCase(register.pending, pending).addCase(register.fulfilled, done).addCase(register.rejected, failed)
     .addCase(login.pending, pending).addCase(login.fulfilled, done).addCase(login.rejected, failed)
     .addCase(restoreSession.fulfilled, (s, a) => {
        s.restoring = false;
        if (a.payload) { s.token = a.payload.token; s.user = a.payload.user; }
      })
     .addCase(restoreSession.rejected, (s) => { s.restoring = false; })
     .addCase(logout.fulfilled, (s) => { s.user = null; s.token = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
