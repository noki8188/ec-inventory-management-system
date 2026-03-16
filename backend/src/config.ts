import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 60)
};
