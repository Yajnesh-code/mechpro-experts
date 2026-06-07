import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client.js";
import { createAccessToken, createRefreshToken } from "../services/token.service.js";

export async function register(req, res) {
  try {
    const { fullName, email, mobile, password, role = "CUSTOMER" } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email and password are required" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(mobile ? [{ mobile }] : [])] },
    });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, mobile: mobile ?? null, passwordHash, role },
      select: { id: true, fullName: true, email: true, mobile: true, role: true, createdAt: true },
    });

    return res.status(201).json({ message: "Registered successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error instanceof Error ? error.message : "Unknown error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user.id, fullName: user.fullName, email: user.email, mobile: user.mobile, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error instanceof Error ? error.message : "Unknown error" });
  }
}

export async function me(req, res) {
  const userId = req.user?.sub;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true, mobile: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user);
}
