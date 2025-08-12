import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  // Auth temporarily disabled for portfolio demo
  return next();
};
    