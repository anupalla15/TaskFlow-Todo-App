import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sign = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !EMAIL_RE.test(email ?? '') || (password ?? '').length < 6) {
      return res.status(400).json({ message: 'Enter a name, a valid email and a password of 6+ characters' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ token: sign(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ message: 'Could not register' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const user = await User.findOne({ email: (email ?? '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password ?? '', user.password))) {
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }
    res.json({ token: sign(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ message: 'Could not log in' });
  }
});

export default router;
