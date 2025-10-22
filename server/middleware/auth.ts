import { Request, Response, NextFunction } from "express";

// Extend Express Request type to include session user
declare module "express-session" {
  interface SessionData {
    userId: string;
    role: string;
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    
    if (!req.session.role || !roles.includes(req.session.role)) {
      return res.status(403).json({ 
        message: "Forbidden. You don't have permission to access this resource." 
      });
    }
    
    next();
  };
};
