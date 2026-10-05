export type Priority = 'low' | 'medium' | 'high';

export interface User { id: string; name: string; email: string }

export interface Task {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO date-time
  deadline: string;    // ISO date-time
  priority: Priority;
  category: string;
  completed: boolean;
}

export type NewTask = Omit<Task, '_id' | 'completed'>;
