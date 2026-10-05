import { Router, Response } from 'express';
import Task from '../models/Task';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth); // every task route needs a logged-in user

// GET /api/tasks - all tasks of the current user
router.get('/', async (req: AuthRequest, res: Response) => {
  const tasks = await Task.find({ user: req.userId }).sort({ deadline: 1 });
  res.json(tasks);
});

// POST /api/tasks - create
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, description, scheduledAt, deadline, priority, category } = req.body ?? {};
  if (!title?.trim() || !scheduledAt || !deadline) {
    return res.status(400).json({ message: 'Title, date-time and deadline are required' });
  }
  if (new Date(deadline) < new Date(scheduledAt)) {
    return res.status(400).json({ message: 'Deadline must be after the scheduled date-time' });
  }
  const task = await Task.create({
    user: req.userId, title, description, scheduledAt, deadline, priority, category: category || 'General',
  });
  res.status(201).json(task);
});

// PATCH /api/tasks/:id - update fields (used for marking completed)
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const allowed = ['title', 'description', 'scheduledAt', 'deadline', 'priority', 'category', 'completed'];
  const update: Record<string, unknown> = {};
  allowed.forEach((k) => req.body?.[k] !== undefined && (update[k] = req.body[k]));
  const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.userId }, update, { new: true });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ id: req.params.id });
});

export default router;
