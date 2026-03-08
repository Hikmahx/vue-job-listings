import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    if (typeof decoded === "string" || !decoded.user) {
      throw new Error("Invalid token");
    }
    req.user = {
      id: decoded.user.id,
      role: decoded.user.role,
    };
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ message: "Token is not valid", errorType: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ message: "Token is not valid", errorType: "INVALID_TOKEN" });
  }
};

// TO CHECK IF THE USER IS THE ONE MAKING THE REQUEST
export const verifyTokenAndUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    if (typeof decoded === "string" || !decoded.user) {
      throw new Error("Invalid token");
    }
    req.user = {
      id: decoded.user.id,
      role: decoded.user.role,
    };

    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "You're not allowed to do that!" });
    }

    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ message: "Token is not valid", errorType: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ message: "Token is not valid", errorType: "INVALID_TOKEN" });
  }
};
