import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth';

dotenv.config();

const router = Router();

/**
 * POST /api/auth/register
 * Body: { employeeId, name, password, role }
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, name, password, role } = req.body;

    if (!employeeId || !name || !password || !role) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    const existingUser = await User.findOne({ employeeId });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists.' });
      return;
    }

    const user = await User.create({
      employeeId,
      name,
      password,
      role
    });

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/login
 * Body: { employeeId: string, password: string }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      res.status(400).json({ message: 'Employee ID and password are required.' });
      return;
    }

    // Find user by employeeId
    const user = await User.findOne({ employeeId });
    if (!user) {
      res.status(401).json({ message: 'Invalid employee ID or password.' });
      return;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid employee ID or password.' });
      return;
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || 'pmsp-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user._id, employeeId: user.employeeId, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.json({
      employeeId: user.employeeId,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
