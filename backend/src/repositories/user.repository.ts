import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findDuplicate(email: string, mobile?: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, ...(mobile ? [{ mobile }] : [])],
      },
    });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  listByRole(role: UserRole) {
    return prisma.user.findMany({ where: { role, status: "ACTIVE" }, orderBy: { name: "asc" } });
  },

  updateRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    return prisma.user.update({ where: { id: userId }, data: { refreshTokenHash } });
  },
};
