import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    next();
  };
};

export const validateQuery = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingParams = requiredParams.filter((param) => !req.query[param]);

    if (missingParams.length > 0) {
      throw new AppError(`Missing required query parameters: ${missingParams.join(', ')}`, 400);
    }

    next();
  };
};

export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    throw new AppError('Invalid ID parameter', 400);
  }

  next();
};
