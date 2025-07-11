import type { Request, Response, NextFunction } from 'express';
import Rollbar from 'rollbar';
import env from '../env';

export const authRequired = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'NotAuthenticated', message: 'User not authenticated' });
    return;
  }

  next();
};

export const ownerOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'NotAuthenticated', message: 'User not authenticated' });
    return;
  }

  if (req.user.id !== Number(req.params.id)) {
    res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    return;
  }

  next();
};

export const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
  const rollbar = new Rollbar({
    enabled: env.isProduction,
    accessToken: env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  if (env.isDevelopment) {
    // eslint-disable-next-line no-console
    console.error('Error handler middleware:', error);
  }

  if (error.name === 'ValidationError') {
    res.status(422).json({ error: error.name, message: error.message });
    return;
  }

  if (error.name === 'ForeignKeyViolationError') {
    res.status(403).json({ error: error.name, message: 'Cannot delete related entity' });
    return;
  }

  rollbar.error(error);

  res.status(500).json({ error: 'InternalServerError', message: 'Internal Server Error' }).end();
};
