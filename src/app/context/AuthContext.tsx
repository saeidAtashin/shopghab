"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

import {
  buildUserFromPhone,
  ensureCatalogCookie,
  extractAuthTokenData,
  refreshAccessToken,
  restoreSession,
  type AuthLoginPayload,
  type SessionUser,
} from "@/lib/auth-api";
import { getPostLoginPath, resolveRoleForPhone } from "@/lib/auth-shared";
import { apiRequest, ApiError } from "@/lib/api-client";
import { normalizeIranPhone } from "@/lib/phone";
import { PRESENCE_INTERVAL_MS } from "@/lib/shop/presence";
import {
  clearAuthSession,
  setAuthToken,
  setRefreshToken,
  setSessionPhone,
} from "@/lib/auth-storage";

type SendOtpResult = {
  success: boolean;
  message?: string;
  smsSent?: boolean;
  devCode?: string;
};

type LoginWithOtpResult = {
  user: SessionUser | null;
  message?: string;
};

export type LoginSessionOptions = {
  redirect?: boolean;
};

type AuthPayload = AuthLoginPayload & {
  user?: SessionUser | null;
  token?: string;
  accessToken?: string;
  smsSent?: boolean;
  devCode?: string;
};

export type CatalogSession = "ready" | "login-required" | "skipped";

type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  catalogSession: CatalogSession;
  loginWithPassword: (phone_number: string, password: string) => Promise<SessionUser | null>;
  sendOtp: (phone_number: string) => Promise<SendOtpResult>;
  loginWithOtp: (
    phone_number: string,
    otp: string,
    options?: LoginSessionOptions,
  ) => Promise<LoginWithOtpResult>;
  register: (name: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/** Remote API often returns 2xx with `{ message, data }` and no `success` flag. */
function isSuccessfulPayload(payload: AuthPayload): boolean {
  return payload.success !== false;
}

function isAdminPhone(phone: string): boolean {
  const normalized = normalizeIranPhone(phone);
  return normalized != null && resolveRoleForPhone(normalized) === "admin";
}

async function loginThroughAdminSession(body: {
  phone_number: string;
  password?: string;
  otp?: string;
}): Promise<AuthPayload | null> {
  const response = await fetch("/api/admin/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) return null;
  return (await response.json()) as AuthPayload;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [catalogSession, setCatalogSession] = useState<CatalogSession>("skipped");

  useEffect(() => {
    void (async () => {
      try {
        const sessionUser = await restoreSession();
        if (sessionUser?.role === "admin") {
          const ok = await ensureCatalogCookie().catch(() => false);
          setCatalogSession(ok ? "ready" : "login-required");
        } else {
          setCatalogSession("skipped");
        }
        setUser(sessionUser);
      } catch {
        clearAuthSession();
        setUser(null);
        setCatalogSession("skipped");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    const phone = normalizeIranPhone(user.phone_number ?? user.phone ?? "");
    if (!phone) return;

    const ping = () => {
      void fetch("/api/activity/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name: user.name }),
      });
    };

    ping();
    const timer = window.setInterval(ping, PRESENCE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loading, user]);

  const completeLoginSession = useCallback(
    async (
      phone_number: string,
      refreshToken: string,
      options: LoginSessionOptions = {},
    ): Promise<SessionUser | null> => {
      const { redirect = true } = options;

      try {
        const refreshed = await refreshAccessToken(refreshToken);
        setAuthToken(refreshed.access);
        setRefreshToken(refreshed.refresh ?? refreshToken);
        setSessionPhone(phone_number);

        const sessionUser = buildUserFromPhone(phone_number);
        setUser(sessionUser);
        setCatalogSession(sessionUser.role === "admin" ? "ready" : "skipped");

        if (redirect) {
          router.replace(getPostLoginPath(sessionUser.role));
        }

        return sessionUser;
      } catch {
        return null;
      }
    },
    [router],
  );

  const loginWithPassword = useCallback(
    async (phone_number: string, password: string): Promise<SessionUser | null> => {
      try {
        const data = isAdminPhone(phone_number)
          ? await loginThroughAdminSession({ phone_number, password })
          : await apiRequest<AuthPayload>("/auth/login/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone_number, password }),
              auth: false,
            });

        if (!data) return null;
        const tokenData = extractAuthTokenData(data);
        if (!isSuccessfulPayload(data) || !tokenData?.refresh) {
          return null;
        }

        const resolvedPhone = tokenData.phone_number ?? phone_number;
        return completeLoginSession(resolvedPhone, tokenData.refresh);
      } catch {
        return null;
      }
    },
    [completeLoginSession],
  );

  const sendOtp = useCallback(async (phone_number: string): Promise<SendOtpResult> => {
    try {
      const payload = await apiRequest<AuthPayload>("/auth/send-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number }),
        auth: false,
      });
      return {
        success: isSuccessfulPayload(payload),
        message:
          typeof payload.message === "string" ? payload.message : undefined,
        smsSent: payload.smsSent === true,
        devCode:
          typeof payload.devCode === "string" ? payload.devCode : undefined,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, message: error.message };
      }
      return {
        success: false,
        message: "پاسخ نامعتبر از سرور",
      };
    }
  }, []);

  const loginWithOtp = useCallback(
    async (
      phone_number: string,
      otp: string,
      options: LoginSessionOptions = {},
    ): Promise<LoginWithOtpResult> => {
      try {
        const data = isAdminPhone(phone_number)
          ? await loginThroughAdminSession({ phone_number, otp })
          : await apiRequest<AuthPayload>("/auth/verify-otp/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone_number, otp }),
              auth: false,
            });

        if (!data) {
          return { user: null, message: "ورود مدیر تایید نشد" };
        }

        const tokenData = extractAuthTokenData(data);
        if (!isSuccessfulPayload(data) || !tokenData?.refresh) {
          return {
            user: null,
            message:
              typeof data.message === "string" ? data.message : "خطا در تایید کد",
          };
        }

        const resolvedPhone = tokenData.phone_number ?? phone_number;
        const sessionUser = await completeLoginSession(
          resolvedPhone,
          tokenData.refresh,
          options,
        );
        if (!sessionUser) {
          return { user: null, message: "خطا در تمدید نشست" };
        }

        return { user: sessionUser };
      } catch (error) {
        if (error instanceof ApiError) {
          return { user: null, message: error.message };
        }
        return { user: null, message: "پاسخ نامعتبر از سرور" };
      }
    },
    [completeLoginSession],
  );

  const register = useCallback((name: string) => {
    setUser({ name, role: "user" });
    setCatalogSession("skipped");
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
    } catch {
      // The catalog cookie is cleared locally when the response arrives.
    }
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore remote logout failure and clear local session state.
    }
    clearAuthSession();
    setUser(null);
    setCatalogSession("skipped");
    router.replace("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        catalogSession,
        loginWithPassword,
        sendOtp,
        loginWithOtp,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
