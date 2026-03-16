import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { config } from "../config.js";

type JwtPayload = {
  userId: number;
  role: Role;
};

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
