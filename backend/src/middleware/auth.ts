import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

/** Verifies the "Authorization: Bearer <token>" header and attaches userId. */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as { id: string };
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
