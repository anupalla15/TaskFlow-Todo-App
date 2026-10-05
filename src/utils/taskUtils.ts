import { Priority, Task } from '../types';
import { SortMode } from '../store/tasksSlice';

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
const HOUR = 3600 * 1000;

/**
 * Smart score (higher = do it sooner). Mixes three signals:
 *   1. Priority   : high 50, medium 30, low 10
 *   2. Deadline   : overdue = 60, otherwise decays smoothly from 50 → 0
 *                   (half of the urgency is gone ~33h before the deadline)
 *   3. Start time : +10 when the task is scheduled to start within 24h or already started
 * Completed tasks always sink to the bottom.
 */
export function smartScore(task: Task, now = Date.now()): number {
  if (task.completed) return -1;
  const priority = { high: 50, medium: 30, low: 10 }[task.priority];
  const hoursLeft = (new Date(task.deadline).getTime() - now) / HOUR;
  const urgency = hoursLeft <= 0 ? 60 : 50 * Math.exp(-hoursLeft / 48);
  const startsSoon = (new Date(task.scheduledAt).getTime() - now) / HOUR <= 24 ? 10 : 0;
  return priority + urgency + startsSoon;
}

export function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  const list = [...tasks];
  const byDeadline = (a: Task, b: Task) => +new Date(a.deadline) - +new Date(b.deadline);
  if (mode === 'deadline') return list.sort((a, b) => Number(a.completed) - Number(b.completed) || byDeadline(a, b));
  if (mode === 'priority') {
    return list.sort((a, b) =>
      Number(a.completed) - Number(b.completed) ||
      PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] || byDeadline(a, b));
  }
  const now = Date.now();
  return list.sort((a, b) => smartScore(b, now) - smartScore(a, now));
}

export const isOverdue = (t: Task) => !t.completed && new Date(t.deadline).getTime() < Date.now();

/** "Due in 3h", "Due tomorrow", "Overdue by 2d" ... */
export function deadlineLabel(t: Task): string {
  const diff = new Date(t.deadline).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hrs = Math.round(abs / HOUR);
  const days = Math.round(abs / (24 * HOUR));
  const span = mins < 60 ? `${mins}m` : hrs < 48 ? `${hrs}h` : `${days}d`;
  return diff < 0 ? `Overdue by ${span}` : `Due in ${span}`;
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
