import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    req.user = {
      uid: token || 'user-1',
      email: 'user@aymc.org.tr',
      name: 'Ayyıldız Sürücüsü'
    };
    next();
  } catch (error) {
    console.error('Error verifying authorization token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
