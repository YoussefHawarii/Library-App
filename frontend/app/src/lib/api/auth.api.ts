import { http } from "@/lib/api/http";
import type { ApiMessage, AuthTokens } from "@/lib/api/types";

export interface SendOtpInput {
  name: string;
  email: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  sendOtp: (input: SendOtpInput) =>
    http.post<ApiMessage>("/user/sendOTP", input).then((res) => res.data),

  signUp: (input: SignUpInput) =>
    http.post<ApiMessage>("/user/signUp", input).then((res) => res.data),

  login: (input: LoginInput) =>
    http.post<AuthTokens & ApiMessage>("/user/login", input).then((res) => res.data),

  googleLogin: (idToken: string) =>
    http.post<AuthTokens & ApiMessage>("/user/google-login", { idToken }).then((res) => res.data),

  deleteAccount: () =>
    http.delete<ApiMessage>("/user/delete").then((res) => res.data),
};
