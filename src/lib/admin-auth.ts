import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface AccessTokenPayload {
  sub: string;
  role: string;
  exp: number;
}

const ADMIN_ROLES = new Set(["admin", "staff"]);

export function getAdminRole(): string | null {
  const token = Cookies.get("access_token");
  if (!token) return null;
  try {
    const payload = jwtDecode<AccessTokenPayload>(token);
    if (payload.exp * 1000 < Date.now()) return null;
    return payload.role;
  } catch {
    return null;
  }
}

export function isAdminUser(): boolean {
  const role = getAdminRole();
  return !!role && ADMIN_ROLES.has(role);
}
