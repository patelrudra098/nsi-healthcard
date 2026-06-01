import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import {
  clearAuthStorage,
  getAccessToken,
  setAccessToken,
} from "@/lib/token";
import type { ApiResponse } from "@/lib/types";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Registered by the auth provider so services never import features. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

// The ngrok free-tunnel interstitial bypass header is ONLY needed for local dev
// against an ngrok URL. In production it's a non-simple header that gets added to
// the CORS preflight's Access-Control-Request-Headers; the real backend doesn't
// allow it, so the preflight is rejected and every call fails with a CORS error.
const usingNgrok = env.apiUrl.includes("ngrok");
const ngrokHeader = usingNgrok
  ? { "ngrok-skip-browser-warning": "true" }
  : {};

export const http = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    ...ngrokHeader,
  },
  timeout: 20000,
});

/** Read the actual payload out of the standard response envelope. */
export function unwrap<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data;
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_EXEMPT = ["/auth/login", "/auth/register", "/auth/refresh"];

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // Bare axios to bypass interceptors; refresh token rides in the HttpOnly cookie.
  const res = await axios.post<ApiResponse<{ accessToken: string }>>(
    `${env.apiUrl}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: { ...ngrokHeader },
    },
  );
  const token = res.data.data.accessToken;
  setAccessToken(token);
  return token;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";
    const isAuthCall = AUTH_EXEMPT.some((path) => url.includes(path));

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (refreshError) {
        refreshPromise = null;
        clearAuthStorage();
        onUnauthorized?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
