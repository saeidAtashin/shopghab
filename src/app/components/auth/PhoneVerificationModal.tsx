"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import {
  IRAN_PHONE_INVALID_MESSAGE,
  isValidIranPhone,
  normalizeIranPhone,
  sanitizePhoneInput,
} from "@/lib/phone";

type Props = {
  open: boolean;
  phone: string;
  onClose: () => void;
  onVerified: (phone: string) => void;
};

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
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [counter, setCounter] = useState(0);
  const [error, setError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState("");
  const [smsSent, setSmsSent] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneLocked = Boolean(initialPhone.trim());

  useEffect(() => {
    if (!open) return;

    setPhone(initialPhone);
    setCodeSent(false);
    setOtpDigits(["", "", "", ""]);
    setCounter(0);
    setError("");
    setDevOtpHint("");
    setSmsSent(false);
  }, [open, initialPhone]);

  useEffect(() => {
    if (codeSent) {
      otpRefs.current[0]?.focus();
    }
  }, [codeSent]);

  useEffect(() => {
    if (!codeSent || counter <= 0) return;

    const timer = setInterval(() => {
      setCounter((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [codeSent, counter]);

  if (!open) return null;

  const handleSendOtp = async () => {
    setError("");

    if (!isValidIranPhone(phone)) {
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

      setPhone(normalizedPhone);
      setCodeSent(true);
      setCounter(120);
      setOtpDigits(["", "", "", ""]);
      setSmsSent(result.smsSent === true);
      setDevOtpHint(result.smsSent ? "" : (result.devCode ?? ""));
    } catch {
      setError("خطا در ارسال کد تایید.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify = async () => {
    setError("");

    const otp = otpDigits.join("");
    if (otp.length !== 4) {
      setError("کد تأیید باید ۴ رقم باشد");
      return;
    }

    const normalizedPhone = normalizeIranPhone(phone);
    if (!normalizedPhone) {
      setError(IRAN_PHONE_INVALID_MESSAGE);
      return;
    }

    setVerifying(true);
    try {
      const result = await loginWithOtp(normalizedPhone, otp, { redirect: false });
      if (!result.user) {
        setError(result.message ?? "کد تایید اشتباه است.");
        return;
      }

      onVerified(normalizedPhone);
    } catch {
      setError("خطا در اعتبارسنجی کد تایید.");
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
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
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

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
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                placeholder="09 / +98 / 98 / 9..."
                autoComplete="tel"
                readOnly={phoneLocked}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-cyan-500 disabled:opacity-70"
              />

              <button
                type="button"
                onClick={() => void handleSendOtp()}
                disabled={sendingOtp || !isValidIranPhone(phone)}
                className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingOtp ? "در حال ارسال..." : "ارسال کد"}
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
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="h-12 w-12 rounded-xl border border-border bg-surface text-center text-xl font-bold text-foreground outline-none focus:border-cyan-500"
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
                onClick={() => void handleVerify()}
                disabled={verifying || counter <= 0}
                className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifying ? "در حال تأیید..." : "تایید"}
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
                  className="w-full rounded-xl bg-surface py-3 text-foreground transition hover:bg-white/15"
                >
                  ارسال مجدد کد
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
