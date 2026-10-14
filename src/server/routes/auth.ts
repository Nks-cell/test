import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbRepository } from '../db/connect.ts';
import { generateToken, requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.ts';

export const authRouter = Router();

// POST /api/auth/login - Admin Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const admin = await dbRepository.findAdminByEmail(email);
    if (!admin) {
      res.status(401).json({ success: false, error: 'Invalid administrator credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid administrator credentials.' });
      return;
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name
    });

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Internal authentication error.' });
  }
});

// GET /api/auth/me - Check current admin session
authRouter.get('/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});
