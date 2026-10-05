import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api, { errorMessage } from '../api/client';
import { NewTask, Task } from '../types';

export type StatusFilter = 'all' | 'active' | 'done';
export type SortMode = 'smart' | 'deadline' | 'priority';

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  filter: StatusFilter;
  sort: SortMode;
  category: string | null; // null = all categories
}

const initialState: TasksState = { items: [], loading: false, error: null, filter: 'all', sort: 'smart', category: null };

export const fetchTasks = createAsyncThunk<Task[], void, { rejectValue: string }>('tasks/fetch', async (_, { rejectWithValue }) => {
  try { return (await api.get<Task[]>('/tasks')).data; } catch (e) { return rejectWithValue(errorMessage(e)); }
});

export const addTask = createAsyncThunk<Task, NewTask, { rejectValue: string }>('tasks/add', async (body, { rejectWithValue }) => {
  try { return (await api.post<Task>('/tasks', body)).data; } catch (e) { return rejectWithValue(errorMessage(e)); }
});

export const toggleTask = createAsyncThunk<Task, Task, { rejectValue: string }>('tasks/toggle', async (task, { rejectWithValue }) => {
  try { return (await api.patch<Task>(`/tasks/${task._id}`, { completed: !task.completed })).data; } catch (e) { return rejectWithValue(errorMessage(e)); }
});

export const deleteTask = createAsyncThunk<string, string, { rejectValue: string }>('tasks/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/tasks/${id}`); return id; } catch (e) { return rejectWithValue(errorMessage(e)); }
});

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (s, a: PayloadAction<StatusFilter>) => { s.filter = a.payload; },
    setSort: (s, a: PayloadAction<SortMode>) => { s.sort = a.payload; },
    setCategory: (s, a: PayloadAction<string | null>) => { s.category = a.payload; },
    clearTasks: () => initialState,
  },
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchTasks.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload ?? 'Failed to load'; })
     .addCase(addTask.fulfilled, (s, a) => { s.items.push(a.payload); })
     .addCase(toggleTask.fulfilled, (s, a) => {
        const i = s.items.findIndex((t) => t._id === a.payload._id);
        if (i >= 0) s.items[i] = a.payload;
      })
     .addCase(deleteTask.fulfilled, (s, a) => { s.items = s.items.filter((t) => t._id !== a.payload); })
     .addCase(toggleTask.rejected, (s, a) => { s.error = a.payload ?? 'Failed'; })
     .addCase(deleteTask.rejected, (s, a) => { s.error = a.payload ?? 'Failed'; });
  },
});

export const { setFilter, setSort, setCategory, clearTasks } = slice.actions;
export default slice.reducer;
