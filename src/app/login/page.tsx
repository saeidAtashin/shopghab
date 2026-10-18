"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import PendingButtonLabel from "@/app/components/auth/PendingButtonLabel";
import {
  IRAN_PHONE_INVALID_MESSAGE,
  isValidIranPhone,
  normalizeIranPhone,
  sanitizePhoneInput,
} from "@/lib/phone";
import { applyOtpInput, emptyOtpDigits, OTP_LENGTH } from "@/lib/otp-digits";
import { getPostLoginPath } from "@/lib/auth-shared";
import { useRouter } from "next/navigation";

const AUTO_SEND_DELAY_MS = 200;

type Mode = "password" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, loginWithPassword, loginWithOtp, sendOtp } =
    useAuth();

  const [mode, setMode] = useState<Mode>("otp");

  const [phone_number, setPhone_number] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [phone, setPhone] = useState<string>("");
  const [otpDigits, setOtpDigits] = useState<string[]>(emptyOtpDigits());

  const [error, setError] = useState<string>("");
  const [counter, setCounter] = useState<number>(0);
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
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
  const lastAutoSentPhone = useRef<string | null>(null);
  const lastAttemptedOtp = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const verifyingRef = useRef(false);
  const counterRef = useRef(counter);
  const phoneRef = useRef(phone);
  counterRef.current = counter;
  phoneRef.current = phone;

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
    setLoggingIn(true);
    try {
      const loggedIn = await loginWithPassword(phone_number, password);
      if (!loggedIn) {
        setError("نام کاربری یا رمز عبور اشتباه است.");
      }
    } catch {
      setError("خطا در ورود با رمز عبور.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPhone(sanitizePhoneInput(e.target.value));
  };

  const handleSendOtp = useCallback(async (rawPhone: string): Promise<void> => {
    setError("");

    const normalizedPhone = normalizeIranPhone(rawPhone);
    if (!normalizedPhone) {
      setError(IRAN_PHONE_INVALID_MESSAGE);
      return;
    }

    if (sendingRef.current) return;

    lastAutoSentPhone.current = normalizedPhone;
    sendingRef.current = true;
    setSendingOtp(true);
    try {
      const result = await sendOtp(normalizedPhone);
      if (!result.success) {
        setError(result.message ?? "خطا در ارسال کد تایید.");
        return;
      }

      setPhone(normalizedPhone);
      setMode("otp");
      setCodeSent(true);
      setCounter(120);
      setOtpDigits(emptyOtpDigits());
      lastAttemptedOtp.current = null;
      setSmsSent(result.smsSent === true);
      setDevOtpHint(result.smsSent ? "" : (result.devCode ?? ""));
      setError("");
    } catch {
      setError("خطا در ارسال کد تایید.");
    } finally {
      sendingRef.current = false;
      setSendingOtp(false);
    }
  }, [sendOtp]);

  const handleOtpLogin = useCallback(async (
    otp: string,
    source: "auto" | "manual" = "manual",
  ): Promise<void> => {
    if (verifyingRef.current) return;
    if (counterRef.current <= 0) return;

    if (otp.length !== OTP_LENGTH) {
      if (source === "manual") setError("کد تأیید باید ۴ رقم باشد");
      return;
    }

    if (source === "auto" && lastAttemptedOtp.current === otp) return;

    const normalizedPhone = normalizeIranPhone(phoneRef.current);
    if (!normalizedPhone) {
      setError(IRAN_PHONE_INVALID_MESSAGE);
      return;
    }

    lastAttemptedOtp.current = otp;
    verifyingRef.current = true;
    setVerifyingOtp(true);
    setError("");
    try {
      const result = await loginWithOtp(normalizedPhone, otp);
      if (!result.user) {
        setError(result.message ?? "کد تایید اشتباه است.");
      }
    } catch {
      setError("خطا در اعتبارسنجی کد تایید.");
    } finally {
      verifyingRef.current = false;
      setVerifyingOtp(false);
    }
  }, [loginWithOtp]);

  useEffect(() => {
    if (mode !== "otp" || codeSent) return;

    const normalized = normalizeIranPhone(phone);
    if (!normalized || lastAutoSentPhone.current === normalized) return;

    const timer = window.setTimeout(() => {
      void handleSendOtp(normalized);
    }, AUTO_SEND_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [mode, codeSent, phone, handleSendOtp]);

  const handleSendOtpSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void handleSendOtp(phone);
  };

  const handleOtpDigitChange = (index: number, value: string): void => {
    if (verifyingOtp || sendingOtp || counter <= 0) return;

    const { digits, focusIndex } = applyOtpInput(otpDigits, index, value);
    setOtpDigits(digits);

    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      lastAttemptedOtp.current = null;
    }

    if (focusIndex !== null) {
      otpRefs.current[focusIndex]?.focus();
    }

    if (code.length === OTP_LENGTH) {
      void handleOtpLogin(code, "auto");
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = (): void => {
    setOtpDigits(emptyOtpDigits());
    lastAttemptedOtp.current = null;
    setError("");
    void handleSendOtp(phone);
  };

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (authLoading || user) {
    return (
      <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted">در حال بارگذاری...</p>
      </main>
    );
  }

  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
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
              type="button"
              onClick={() => void handlePasswordLogin()}
              disabled={loggingIn}
              aria-busy={loggingIn}
              className="inline-flex w-full items-center justify-center bg-cyan-500 text-black font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PendingButtonLabel
                pending={loggingIn}
                idle="ورود"
                pendingLabel="در حال ورود..."
              />
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
                  disabled={sendingOtp}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 disabled:opacity-70"
                />

                <button
                  type="submit"
                  disabled={sendingOtp || !validatePhone(phone)}
                  aria-busy={sendingOtp}
                  className="inline-flex w-full items-center justify-center bg-surface py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PendingButtonLabel
                    pending={sendingOtp}
                    idle="ارسال کد"
                    pendingLabel="در حال ارسال..."
                  />
                </button>
              </form>
            ) : (
              <>
                {/* 4 input OTP */}
                <div className="flex justify-center gap-3" dir="ltr">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="tel"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={index === 0 ? OTP_LENGTH : 1}
                      value={digit}
                      disabled={verifyingOtp || sendingOtp}
                      onFocus={(event) => event.currentTarget.select()}
                      onChange={(e) =>
                        handleOtpDigitChange(index, e.target.value)
                      }
                      onPaste={(event) => {
                        const text = event.clipboardData.getData("text");
                        if (text.replace(/\D/g, "").length <= 1) return;
                        event.preventDefault();
                        handleOtpDigitChange(index, text);
                      }}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold bg-surface border border-border rounded-xl disabled:opacity-70"
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
                  type="button"
                  onClick={() => void handleOtpLogin(otpDigits.join(""))}
                  disabled={verifyingOtp || sendingOtp || counter <= 0}
                  aria-busy={verifyingOtp}
                  className="inline-flex w-full items-center justify-center bg-cyan-500 text-black font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PendingButtonLabel
                    pending={verifyingOtp}
                    idle="تایید و ورود"
                    pendingLabel="در حال تأیید..."
                  />
                </button>

                {counter <= 0 && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={sendingOtp}
                    aria-busy={sendingOtp}
                    className="inline-flex w-full items-center justify-center bg-surface py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PendingButtonLabel
                      pending={sendingOtp}
                      idle="ارسال مجدد کد"
                      pendingLabel="در حال ارسال..."
                    />
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
