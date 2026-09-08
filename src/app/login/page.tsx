"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  IRAN_PHONE_INVALID_MESSAGE,
  isValidIranPhone,
  normalizeIranPhone,
  sanitizePhoneInput,
} from "@/lib/phone";
import { getPostLoginPath } from "@/lib/auth-shared";
import { useRouter } from "next/navigation";

type Mode = "password" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, loginWithPassword, loginWithOtp, sendOtp } =
    useAuth();

  const [mode, setMode] = useState<Mode>("otp");

  const [phone_number, setPhone_number] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [phone, setPhone] = useState<string>("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);

  const [error, setError] = useState<string>("");
  const [counter, setCounter] = useState<number>(0);
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  /** Shown when SMS is skipped (OTP_SKIP_SMS) — matches server-side code for verify */
  const [devOtpHint, setDevOtpHint] = useState<string>("");
  const [smsSent, setSmsSent] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getPostLoginPath(user.role));
    }
  }, [authLoading, user, router]);

  // refs برای ۴ input
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // وقتی وارد حالت OTP شد و کد ارسال شد، روی input اول فوکوس کن
  useEffect(() => {
    if (codeSent) {
      otpRefs.current[0]?.focus();
    }
  }, [codeSent]);

  // Countdown timer (server validates expiry on /api/auth/otp/verify)
  useEffect(() => {
    if (!codeSent || counter <= 0) return;

    const timer = setInterval(() => {
      setCounter((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [codeSent, counter]);

  const validatePhone = (value: string): boolean => isValidIranPhone(value);

  const handlePasswordLogin = async (): Promise<void> => {
    setError("");
    try {
      const loggedIn = await loginWithPassword(phone_number, password);
      if (!loggedIn) {
        setError("نام کاربری یا رمز عبور اشتباه است.");
      }
    } catch {
      setError("خطا در ورود با رمز عبور.");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPhone(sanitizePhoneInput(e.target.value));
  };

  const handleOtpDigitChange = (index: number, value: string): void => {
    const digit = value.replace(/\D/g, "").slice(0, 1);

    setOtpDigits((prev) => {
      const updated = [...prev];
      updated[index] = digit;
      return updated;
    });

    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSendOtp = async (): Promise<void> => {
    setError("");

    if (!validatePhone(phone)) {
      setError(IRAN_PHONE_INVALID_MESSAGE);
      return;
    }

    if (sendingOtp) return;

    setSendingOtp(true);
    try {
      const normalizedPhone = normalizeIranPhone(phone)!;
      const result = await sendOtp(normalizedPhone);
      if (!result.success) {
        setError(result.message ?? "خطا در ارسال کد تایید.");
        return;
      }

      setMode("otp");
      setCodeSent(true);
      setCounter(120);
      setOtpDigits(["", "", "", ""]);
      setSmsSent(result.smsSent === true);
      setDevOtpHint(result.smsSent ? "" : (result.devCode ?? ""));
      setError("");
    } catch {
      setError("خطا در ارسال کد تایید.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSendOtpSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void handleSendOtp();
  };

  const handleOtpLogin = async (): Promise<void> => {
    setError("");

    const otp = otpDigits.join("");

    if (otp.length !== 4) {
      setError("کد تأیید باید ۴ رقم باشد");
      return;
    }

    try {
      const normalizedPhone = normalizeIranPhone(phone);
      if (!normalizedPhone) {
        setError(IRAN_PHONE_INVALID_MESSAGE);
        return;
      }

      const result = await loginWithOtp(normalizedPhone, otp);
      if (!result.user) {
        setError(result.message ?? "کد تایید اشتباه است.");
      }
    } catch {
      setError("خطا در اعتبارسنجی کد تایید.");
    }
  };

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (authLoading || user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted">در حال بارگذاری...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-black mb-2 text-center">ورود</h1>
        <p className="text-muted text-center mb-8">ورود به حساب کاربری</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setMode("password");
              setError("");
              setDevOtpHint("");
              setSmsSent(false);
            }}
            className={`flex-1 py-3 rounded-xl ${mode === "password" ? "bg-cyan-500 text-black" : "bg-surface"
              }`}
          >
            رمز عبور
          </button>

          <button
            onClick={() => {
              setMode("otp");
              setError("");
              setDevOtpHint("");
              setSmsSent(false);
            }}
            className={`flex-1 py-3 rounded-xl ${mode === "otp" ? "bg-cyan-500 text-black" : "bg-surface"
              }`}
          >
            OTP
          </button>
        </div>

        {mode === "password" ? (
          <div className="space-y-4">
            <input
              value={phone_number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPhone_number(e.target.value)
              }
              placeholder="نام کاربری"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3"
            />

            <input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="رمز عبور"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3"
            />

            <button
              onClick={handlePasswordLogin}
              className="w-full bg-cyan-500 text-black font-bold py-3 rounded-xl"
            >
              ورود
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {!codeSent ? (
              <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="09 / +98 / 98 / 9..."
                  autoComplete="tel"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3"
                />

                <button
                  type="submit"
                  disabled={sendingOtp || !validatePhone(phone)}
                  className="w-full bg-surface py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingOtp ? "در حال ارسال..." : "ارسال کد"}
                </button>
              </form>
            ) : (
              <>
                {/* 4 input OTP */}
                <div className="flex justify-center gap-3" dir="ltr">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      // ref={(el) => (otpRefs.current[index] = el)}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpDigitChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold bg-surface border border-border rounded-xl"
                    />
                  ))}
                </div>

                <p className="text-sm text-center text-muted">
                  {counter > 0
                    ? `زمان باقی‌مانده: ${formatTime(counter)}`
                    : "زمان کد به پایان رسید — دوباره ارسال کنید."}
                </p>

                {(smsSent || codeSent) && (
                  <p className="text-sm text-center text-emerald-400/90">
                    کد تأیید به {phone} ارسال شد.
                  </p>
                )}

                {devOtpHint && (
                  <p className="text-sm text-center text-amber-400/90">
                    بدون پیامک (OTP_SKIP_SMS): کد {devOtpHint}
                  </p>
                )}

                <button
                  onClick={handleOtpLogin}
                  disabled={counter <= 0}
                  className="w-full bg-cyan-500 text-black font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تایید و ورود
                </button>

                {counter <= 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCodeSent(false);
                      setOtpDigits(["", "", "", ""]);
                      setDevOtpHint("");
                      setSmsSent(false);
                      setError("");
                    }}
                    className="w-full bg-surface py-3 rounded-xl"
                  >
                    ارسال مجدد کد
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-400 mt-4 text-sm text-center">{error}</p>
        )}
      </div>
    </main>
  );
}
