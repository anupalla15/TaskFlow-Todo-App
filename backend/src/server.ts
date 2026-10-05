import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const port = Number(process.env.PORT) || 5000;
connectDB()
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`API on :${port}`)))
  .catch((err) => { console.error(err); process.exit(1); });
