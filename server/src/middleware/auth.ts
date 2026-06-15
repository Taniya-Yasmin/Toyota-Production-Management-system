import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend Express Request to carry authenticated user info with role
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        employeeId: string;
        role: 'Admin' | 'Manager' | 'Team Leader' | 'Operator';
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  employeeId: string;
  role: 'Admin' | 'Manager' | 'Team Leader' | 'Operator';
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'pmsp-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      employeeId: decoded.employeeId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
    return;
  }
}

// Middleware to authorize specific roles
export function authorize(allowedRoles: ('Admin' | 'Manager' | 'Team Leader' | 'Operator')[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized. Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: `Forbidden. Requires one of: ${allowedRoles.join(', ')}` });
      return;
    }

    next();
  };
}
