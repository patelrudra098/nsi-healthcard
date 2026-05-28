import { STORAGE_KEYS } from "@/config/constants";
import type { User } from "@/lib/types";

const isBrowser = typeof window !== "undefined";

export function getAccessToken(): string | null {
  if (!isBrowser) return null;
  return window.localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function setAccessToken(token: string): void {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEYS.accessToken, token);
}

export function getStoredUser(): User | null {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearAuthStorage(): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(STORAGE_KEYS.user);
}
