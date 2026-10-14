import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const clientIps = new Map<string, RateLimitRecord>();

export function rateLimit(limit: number = 60, windowMs: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const current = clientIps.get(ip);
    if (!current || current.resetAt < now) {
      clientIps.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= limit) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment before trying again.'
      });
      return;
    }

    current.count += 1;
    next();
  };
}
