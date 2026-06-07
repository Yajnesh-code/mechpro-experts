import type { PortalRole } from "@/lib/portal-data";

export type { PortalRole };

export type AuthUser = {
  id: string;
  email: string;
  password?: string;
  role: PortalRole;
  name: string;
  phone?: string;
  company?: string;
  city?: string;
  token?: string;
};

export type AuthSession = {
  user: Omit<AuthUser, "password">;
  token: string;
  role: PortalRole;
};
