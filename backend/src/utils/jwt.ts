import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.js";
import { env } from "../config/env.js";

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn } as SignOptions);
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn } as SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}
