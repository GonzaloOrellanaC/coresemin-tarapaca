import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign(
      { username },
      // cast to jwt.Secret to satisfy TypeScript types for jsonwebtoken v9
      JWT_SECRET as unknown as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } as jwt.SignOptions,
    );
    return res.json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
