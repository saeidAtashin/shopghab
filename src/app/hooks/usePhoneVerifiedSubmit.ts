"use client";

import { useCallback, useRef, useState } from "react";

import { useAuth } from "@/app/context/AuthContext";
import { normalizeIranPhone } from "@/lib/phone";

export class VerificationCancelledError extends Error {
  constructor() {
    super("VERIFICATION_CANCELLED");
    this.name = "VerificationCancelledError";
  }
}

function getSessionPhone(user: {
  phone?: string;
  phone_number?: string;
} | null): string | null {
  if (!user) return null;
  const raw = user.phone_number ?? user.phone ?? "";
  return normalizeIranPhone(raw);
}

function needsVerification(
  phone: string,
  user: { phone?: string; phone_number?: string } | null,
): boolean {
  if (!user) return true;
  const sessionPhone = getSessionPhone(user);
  return sessionPhone !== phone;
}

export function usePhoneVerifiedSubmit() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhone, setModalPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const pendingSubmitRef = useRef<(() => Promise<void>) | null>(null);
  const pendingResolveRef = useRef<(() => void) | null>(null);
  const pendingRejectRef = useRef<((error: unknown) => void) | null>(null);

  const clearPending = useCallback(() => {
    pendingSubmitRef.current = null;
    pendingResolveRef.current = null;
    pendingRejectRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setVerifying(false);
    pendingRejectRef.current?.(new VerificationCancelledError());
    clearPending();
  }, [clearPending]);

  const handleVerified = useCallback(async (_phone: string) => {
    setModalOpen(false);
    setVerifying(true);

    const submitFn = pendingSubmitRef.current;
    const resolve = pendingResolveRef.current;
    const reject = pendingRejectRef.current;
    clearPending();

    try {
      await submitFn?.();
      resolve?.();
    } catch (error) {
      reject?.(error);
    } finally {
      setVerifying(false);
    }
  }, [clearPending]);

  const requestSubmit = useCallback(
    async (phone: string, submitFn: () => Promise<void>) => {
      const normalizedPhone = normalizeIranPhone(phone);
      if (!normalizedPhone) {
        throw new Error("شماره موبایل معتبر نیست.");
      }

      if (!needsVerification(normalizedPhone, user)) {
        await submitFn();
        return;
      }

      await new Promise<void>((resolve, reject) => {
        pendingSubmitRef.current = submitFn;
        pendingResolveRef.current = resolve;
        pendingRejectRef.current = reject;
        setModalPhone(normalizedPhone);
        setModalOpen(true);
      });
    },
    [user],
  );

  return {
    requestSubmit,
    verifying: verifying || modalOpen,
    modalProps: {
      open: modalOpen,
      phone: modalPhone,
      onClose: handleClose,
      onVerified: handleVerified,
    },
  };
}
