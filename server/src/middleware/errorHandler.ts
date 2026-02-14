import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ERROR]', err.message, err.stack);

  const status = (err as { status?: number }).status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}
