import { prisma } from "../prisma/client.js";

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, email: true, mobile: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.status(200).json(users);
}
