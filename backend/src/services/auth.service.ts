import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/errors.js";
import { signToken } from "../utils/jwt.js";

export async function registerUser(email: string, name: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "Email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: Role.USER
    }
  });

  return {
    token: signToken({ userId: user.id, role: user.role }),
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid credentials.");
  }

  return {
    token: signToken({ userId: user.id, role: user.role }),
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  };
}
