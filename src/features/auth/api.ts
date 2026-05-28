import { http, unwrap } from "@/services";
import type { User } from "@/lib/types";
import type { LoginInput, RegisterInput } from "./types";

interface AuthPayload {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: async (input: RegisterInput): Promise<AuthPayload> =>
    unwrap<AuthPayload>(await http.post("/auth/register", input)),

  login: async (input: LoginInput): Promise<AuthPayload> =>
    unwrap<AuthPayload>(await http.post("/auth/login", input)),

  logout: async (): Promise<void> => {
    await http.post("/auth/logout");
  },
};
