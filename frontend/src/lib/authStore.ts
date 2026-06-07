import type { ApiUser } from "@/lib/api";
import type { AuthSession, AuthUser, PortalRole } from "@/types/auth";

const USERS_KEY = "mechpro_mock_users";
const SESSION_KEY = "mechpro_auth_session";

type BackendRole = ApiUser["role"];

const seededUsers: AuthUser[] = [
  {
    id: "seed-admin",
    email: "admin@mechproexperts.in",
    password: "admin12345",
    role: "admin",
    name: "Admin User",
    phone: "+91 90000 00000",
    company: "MechPro Experts HQ",
    city: "Mumbai",
  },
  {
    id: "seed-sales",
    email: "sales@mechproexperts.in",
    password: "sales12345",
    role: "sales",
    name: "Ravi Sharma",
    phone: "+91 90000 00001",
    company: "MechPro Sales Partner",
    city: "Mumbai",
  },
  {
    id: "seed-service",
    email: "service@mechproexperts.in",
    password: "service12345",
    role: "service",
    name: "Arun Joshi",
    phone: "+91 90000 00002",
    company: "SpeedFix Garage",
    city: "Navi Mumbai",
  },
  {
    id: "seed-customer",
    email: "customer@mechproexperts.in",
    password: "customer12345",
    role: "customer",
    name: "Rajesh Sharma",
    phone: "+91 90000 00003",
    city: "Thane",
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function backendRoleToPortalRole(role: BackendRole): PortalRole {
  if (role === "admin") return "admin";
  if (role === "sales") return "sales";
  if (role === "service" || role === "workshop") return "service";
  if (role === "customer") return "customer";
  throw new Error(`Unsupported backend role: ${role}`);
}

export function roleToDashboardPath(role: PortalRole) {
  return `/dashboard/${role}`;
}

export function readUsers(): AuthUser[] {
  if (!canUseStorage()) return seededUsers;

  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers));
    return seededUsers;
  }

  try {
    const users = JSON.parse(stored) as AuthUser[];
    const missingSeeds = seededUsers.filter(
      (seed) => !users.some((user) => user.email.toLowerCase() === seed.email.toLowerCase()),
    );
    const merged = [...users, ...missingSeeds];
    if (missingSeeds.length > 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers));
    return seededUsers;
  }
}

export function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return readUsers().find((user) => user.email.toLowerCase() === normalized);
}

export function findUserByIdentifier(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  const normalizedPhone = normalizePhone(identifier);

  return readUsers().find((user) => {
    const emailMatches = user.email.toLowerCase() === normalized;
    const phoneMatches = user.phone ? normalizePhone(user.phone) === normalizedPhone : false;
    return emailMatches || phoneMatches;
  });
}

export function saveUser(user: AuthUser) {
  if (!canUseStorage()) return;

  const users = readUsers();
  const withoutExisting = users.filter((item) => item.email.toLowerCase() !== user.email.toLowerCase());
  localStorage.setItem(USERS_KEY, JSON.stringify([...withoutExisting, user]));
}

export function saveSession(session: AuthSession) {
  if (!canUseStorage()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readSession(): AuthSession | null {
  if (!canUseStorage()) return null;

  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("mechpro_access_token");
  localStorage.removeItem("mechpro_refresh_token");
  localStorage.removeItem("mechpro_user");
}

export function createMockToken(role: PortalRole) {
  return `mock-${role}-${randomId()}`;
}

export function createUserId() {
  return `user-${randomId()}`;
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function isStrongPassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}
