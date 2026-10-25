"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import PendingButtonLabel from "@/app/components/auth/PendingButtonLabel";
import { useAuth } from "@/app/context/AuthContext";
import { applyOtpInput, emptyOtpDigits, OTP_LENGTH } from "@/lib/otp-digits";
import {
  IRAN_PHONE_INVALID_MESSAGE,
  isValidIranPhone,
  normalizeIranPhone,
  sanitizePhoneInput,
} from "@/lib/phone";
import { lockPageScroll } from "@/lib/scroll-lock";

type Props = {
  open: boolean;
  phone: string;
  onClose: () => void;
  onVerified: (phone: string) => void;
};

const AUTO_SEND_DELAY_MS = 200;

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function PhoneVerificationModal({
  open,
  phone: initialPhone,
  onClose,
  onVerified,
}: Props) {
  const { sendOtp, loginWithOtp } = useAuth();

  const [phone, setPhone] = useState(initialPhone);
  const [codeSent, setCodeSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(emptyOtpDigits());
  const [counter, setCounter] = useState(0);
  const [error, setError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState("");
  const [smsSent, setSmsSent] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const lastAutoSentPhone = useRef<string | null>(null);
  const lastAttemptedOtp = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const verifyingRef = useRef(false);
  const sendGeneration = useRef(0);
  const verifyGeneration = useRef(0);
  const counterRef = useRef(counter);
  const phoneRef = useRef(phone);
  counterRef.current = counter;
  phoneRef.current = phone;

  const phoneLocked = Boolean(initialPhone.trim());

  useEffect(() => {
    if (!open) return;
    return lockPageScroll();
  }, [open]);

  useEffect(() => {
    if (!open) {
      sendGeneration.current += 1;
      verifyGeneration.current += 1;
      return;
    }

    sendGeneration.current += 1;
    verifyGeneration.current += 1;
    lastAutoSentPhone.current = null;
    lastAttemptedOtp.current = null;
    sendingRef.current = false;
    verifyingRef.current = false;
    setPhone(initialPhone);
    setCodeSent(false);
    setOtpDigits(emptyOtpDigits());
    setCounter(0);
    setError("");
    setDevOtpHint("");
    setSmsSent(false);
    setSendingOtp(false);
    setVerifying(false);
  }, [open, initialPhone]);

  useEffect(() => {
    if (!open || codeSent || phoneLocked || sendingOtp) return;
    phoneInputRef.current?.focus();
  }, [open, codeSent, phoneLocked, sendingOtp]);

  useEffect(() => {
    if (codeSent && !sendingOtp) {
      otpRefs.current[0]?.focus();
    }
  }, [codeSent, sendingOtp]);

  useEffect(() => {
    if (!open || !codeSent || verifying || !error) return;
    otpRefs.current[0]?.focus();
  }, [open, codeSent, verifying, error]);

  useEffect(() => {
    if (!codeSent || counter <= 0) return;

    const timer = setInterval(() => {
      setCounter((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [codeSent, counter]);

  const handleSendOtp = useCallback(
    async (rawPhone: string) => {
      setError("");

      const normalizedPhone = normalizeIranPhone(rawPhone);
      if (!normalizedPhone) {
        setError(IRAN_PHONE_INVALID_MESSAGE);
        return;
      }

      if (sendingRef.current) return;

      const generation = ++sendGeneration.current;
      lastAutoSentPhone.current = normalizedPhone;
      sendingRef.current = true;
      setSendingOtp(true);
      try {
        const result = await sendOtp(normalizedPhone);
        if (generation !== sendGeneration.current) return;
        if (!result.success) {
          setError(result.message ?? "خطا در ارسال کد تایید.");
          return;
        }

        setPhone(normalizedPhone);
        setCodeSent(true);
        setCounter(120);
        setOtpDigits(emptyOtpDigits());
        lastAttemptedOtp.current = null;
        setSmsSent(result.smsSent === true);
        setDevOtpHint(result.smsSent ? "" : (result.devCode ?? ""));
      } catch {
        if (generation !== sendGeneration.current) return;
        setError("خطا در ارسال کد تایید.");
      } finally {
        if (generation === sendGeneration.current) {
          sendingRef.current = false;
          setSendingOtp(false);
        }
      }
    },
    [sendOtp],
  );

  const handleVerify = useCallback(
    async (otp: string, source: "auto" | "manual" = "manual") => {
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

      const generation = ++verifyGeneration.current;
      lastAttemptedOtp.current = otp;
      verifyingRef.current = true;
      setVerifying(true);
      setError("");
      try {
        const result = await loginWithOtp(normalizedPhone, otp, { redirect: false });
        if (generation !== verifyGeneration.current) return;
        if (!result.user) {
          setError(result.message ?? "کد تایید اشتباه است.");
          return;
        }

        onVerified(normalizedPhone);
      } catch {
        if (generation !== verifyGeneration.current) return;
        setError("خطا در اعتبارسنجی کد تایید.");
      } finally {
        if (generation === verifyGeneration.current) {
          verifyingRef.current = false;
          setVerifying(false);
        }
      }
    },
    [loginWithOtp, onVerified],
  );

  useEffect(() => {
    if (!open || codeSent) return;

    const normalized = normalizeIranPhone(phone);
    if (!normalized || lastAutoSentPhone.current === normalized) return;

    const timer = window.setTimeout(() => {
      void handleSendOtp(normalized);
    }, AUTO_SEND_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [open, codeSent, phone, handleSendOtp]);

  const handleOtpDigitChange = (index: number, value: string) => {
    if (verifying || sendingOtp || counter <= 0) return;

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
      void handleVerify(code, "auto");
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setOtpDigits(emptyOtpDigits());
    lastAttemptedOtp.current = null;
    setError("");
    void handleSendOtp(phone);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-verification-title"
        className="relative w-full max-w-md rounded-3xl border border-border bg-[#050816] p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 rounded-xl p-2 text-muted transition hover:bg-surface hover:text-foreground"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="phone-verification-title"
          className="text-2xl font-black text-center text-cyan-400"
        >
          تأیید شماره موبایل
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          برای ثبت درخواست، شماره موبایل خود را با کد تأیید وارد کنید.
        </p>

        <div className="mt-8 space-y-4">
          {!codeSent ? (
            <>
              <input
                ref={phoneInputRef}
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                placeholder="09 / +98 / 98 / 9..."
                autoComplete="tel"
                readOnly={phoneLocked}
                disabled={sendingOtp}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-cyan-500 disabled:opacity-70"
              />

              <button
                type="button"
                onClick={() => void handleSendOtp(phone)}
                disabled={sendingOtp || !isValidIranPhone(phone)}
                aria-busy={sendingOtp}
                className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PendingButtonLabel
                  pending={sendingOtp}
                  idle="ارسال کد"
                  pendingLabel="در حال ارسال..."
                />
              </button>
            </>
          ) : (
            <>
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
                    disabled={verifying || sendingOtp}
                    onFocus={(event) => event.currentTarget.select()}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onPaste={(event) => {
                      const text = event.clipboardData.getData("text");
                      if (text.replace(/\D/g, "").length <= 1) return;
                      event.preventDefault();
                      handleOtpDigitChange(index, text);
                    }}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="h-12 w-12 rounded-xl border border-border bg-surface text-center text-xl font-bold text-foreground outline-none focus:border-cyan-500 disabled:opacity-70"
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
                onClick={() => void handleVerify(otpDigits.join(""))}
                disabled={verifying || sendingOtp || counter <= 0}
                aria-busy={verifying}
                className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PendingButtonLabel
                  pending={verifying}
                  idle="تایید"
                  pendingLabel="در حال تأیید..."
                />
              </button>

              {counter <= 0 && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={sendingOtp}
                  aria-busy={sendingOtp}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-surface py-3 text-foreground transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
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

        {error && (
          <p className="mt-4 text-center text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
