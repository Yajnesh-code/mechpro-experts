import type { Request } from "express";
import type { UserRole } from "@prisma/client";

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  id?: string;
};

export type AuthenticatedUser = JwtPayload & {
  id: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
