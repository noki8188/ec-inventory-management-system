import { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/errors.js";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required."));
  }

  try {
    const token = header.replace("Bearer ", "");
    req.auth = verifyToken(token);
    next();
  } catch {
    next(new ApiError(401, "Invalid token."));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = header.replace("Bearer ", "");
    req.auth = verifyToken(token);
  } catch {
    req.auth = undefined;
  }
  next();
}

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new ApiError(401, "Authentication required."));
    }
    if (req.auth.role !== role) {
      return next(new ApiError(403, "Forbidden."));
    }
    next();
  };
}
