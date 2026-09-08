"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ListPlus } from "lucide-react";

import PhoneVerificationModal from "@/app/components/auth/PhoneVerificationModal";
import GameInstallListCountBadge from "@/app/components/game-install/GameInstallListCountBadge";
import InstallListGameItem from "@/app/components/game-install/InstallListGameItem";
import { FormInput } from "@/app/components/ui/form";
import { useAuth } from "@/app/context/AuthContext";
import { useInstallMethodId } from "@/app/hooks/useInstallMethod";
import { useInstallGameList } from "@/app/hooks/useInstallGameList";
import {
  usePhoneVerifiedSubmit,
  VerificationCancelledError,
} from "@/app/hooks/usePhoneVerifiedSubmit";
import { ApiError } from "@/lib/api-client";
import {
  addCustomGameToInstallList,
  clearInstallGameListForConsole,
  removeFromInstallGameList,
} from "@/lib/game-install-list";
import { normalizeIranPhone, sanitizePhoneInput } from "@/lib/phone";
import { consoleIdFromGameInstallSlug } from "@/lib/repair-links";
import { submitGameInstallRequest } from "@/lib/repair/api";
import { INSTALL_FAB_DOCKED_EVENT } from "@/lib/game-install/fly-to-list";

type Props = {
  consoleSlug: string;
  consoleLabel: string;
  variant?: "default" | "compact";
  embedded?: boolean;
};

export default function GameInstallOrderPanel({
  consoleSlug,
  consoleLabel,
  variant = "default",
  embedded = false,
}: Props) {
  const { user } = useAuth();
  const { requestSubmit, verifying, modalProps } = usePhoneVerifiedSubmit();
  const games = useInstallGameList(consoleSlug);
  const installMethodId = useInstallMethodId(consoleSlug);

  const [customName, setCustomName] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitHighlight, setSubmitHighlight] = useState(false);

  const accountPhone = user?.phone_number ?? user?.phone ?? "";

  useEffect(() => {
    if (accountPhone) {
      setPhone(accountPhone);
    }
  }, [accountPhone]);

  useEffect(() => {
    function onFabDocked() {
      setSubmitHighlight(true);
      window.setTimeout(() => setSubmitHighlight(false), 550);
    }
    window.addEventListener(INSTALL_FAB_DOCKED_EVENT, onFabDocked);
    return () => window.removeEventListener(INSTALL_FAB_DOCKED_EVENT, onFabDocked);
  }, []);

  const consoleId = consoleIdFromGameInstallSlug(consoleSlug);

  function handleAddCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCustomError(null);

    const added = addCustomGameToInstallList(customName, consoleSlug);
    if (!added) {
      setCustomError(
        customName.trim()
          ? "این بازی قبلاً در لیست است یا نام نامعتبر است."
          : "نام بازی را وارد کنید.",
      );
      return;
    }

    setCustomName("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (games.length === 0) {
      setSubmitError("حداقل یک بازی انتخاب کنید.");
      return;
    }

    if (!consoleId) {
      setSubmitError("کنسول نامعتبر است.");
      return;
    }

    const normalizedPhone = normalizeIranPhone(phone);
    if (!normalizedPhone) {
      setSubmitError("شماره موبایل معتبر نیست.");
      return;
    }

    setLoading(true);
    try {
      await requestSubmit(normalizedPhone, async () => {
        await submitGameInstallRequest({
          consoleId,
          phone: normalizedPhone,
          name: name.trim() || undefined,
          games,
          consoleLabel,
          installMethodId,
        });
        clearInstallGameListForConsole(consoleSlug);
        setSuccess(true);
        setName("");
      });
    } catch (error) {
      if (error instanceof VerificationCancelledError) {
        return;
      }
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setLoading(false);
    }
  }

  const sectionId = "game-install-order";
  const showHeader = !embedded && variant === "default";

  if (success) {
    return (
      <section
        id={sectionId}
        className={`mb-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 ${
          embedded ? "m-0 border-0 bg-transparent" : "p-6 md:p-8"
        }`}
      >
        <h2 className="text-2xl font-black text-emerald-200">
          درخواست نصب ثبت شد
        </h2>
        <p className="mt-3 text-emerald-100/90">
          لیست بازی‌های شما برای {consoleLabel} ثبت شد. به‌زودی با شما تماس
          می‌گیریم.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-2xl border border-emerald-400/30 px-6 py-3 text-sm font-bold text-emerald-200 transition hover:border-emerald-400/50"
        >
          ثبت درخواست جدید
        </button>
      </section>
    );
  }

  return (
    <section
      id={sectionId}
      className={
        embedded
          ? "p-4 md:p-6"
          : `mb-12 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 ${
              variant === "compact" ? "p-5" : "p-6 md:p-8"
            }`
      }
      aria-labelledby={
        showHeader ? "game-install-order-title" : undefined
      }
    >
      {showHeader ? (
        <div className="mb-6">
          <h2
            id="game-install-order-title"
            className="text-2xl font-black text-foreground"
          >
            لیست بازی‌های من برای {consoleLabel}
            {games.length > 0 ? (
              <GameInstallListCountBadge className="relative ms-3 inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-300">
                {games.length.toLocaleString("fa-IR")} بازی
              </GameInstallListCountBadge>
            ) : null}
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            از کاتالوگ بازی اضافه کنید یا نام بازی دلخواه را بنویسید، سپس
            درخواست نصب را ثبت کنید.
          </p>
        </div>
      ) : embedded ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-black text-foreground">
            بازی‌های انتخاب‌شده
            {games.length > 0 ? (
              <GameInstallListCountBadge className="relative ms-2 inline-flex rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-sm text-emerald-200">
                {games.length.toLocaleString("fa-IR")}
              </GameInstallListCountBadge>
            ) : null}
          </h3>
          {games.length === 0 ? (
            <span className="text-xs text-muted">هنوز خالی است</span>
          ) : null}
        </div>
      ) : variant === "compact" ? (
        <div className="mb-6">
          <h2 className="text-xl font-black text-foreground">
            لیست بازی‌های من برای {consoleLabel}
          </h2>
        </div>
      ) : null}

      {games.length === 0 ? (
        <p className="mb-6 rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          هنوز بازی‌ای انتخاب نکرده‌اید. از لیست بالا «اضافه به لیست بازی‌ها» را
          بزنید یا نام بازی را پایین بنویسید.
        </p>
      ) : (
        <ol className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
          {games.map((game, index) => (
            <InstallListGameItem
              key={game.id}
              game={game}
              index={index}
              onRemove={removeFromInstallGameList}
            />
          ))}
        </ol>
      )}

      <form
        onSubmit={handleAddCustom}
        className="mb-6 flex flex-col gap-3 sm:flex-row"
      >
        <FormInput
          label="افزودن بازی دلخواه"
          id={`custom-game-${consoleSlug}`}
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="مثلاً Red Dead Redemption 2"
          fieldClassName="flex-1"
          error={customError}
        />
        <button
          type="submit"
          className="inline-flex h-14 shrink-0 items-center justify-center gap-2 self-end rounded-2xl border border-cyan-400/30 bg-cyan-500/20 px-6 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/30 sm:self-auto"
        >
          <ListPlus className="h-4 w-4" aria-hidden />
          افزودن
        </button>
      </form>

      <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-6">
        <FormInput
          label="شماره تماس *"
          id={`install-phone-${consoleSlug}`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            setPhone(sanitizePhoneInput(e.target.value));
          }}
          placeholder="09 / +98 / 98 / 9..."
          className="placeholder:text-end text-end"
        />

        <FormInput
          label="نام ( اختیاری )"
          id={`install-name-${consoleSlug}`}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً علی محمدی"
        />

        {submitError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {submitError}
          </p>
        ) : null}

        <motion.button
          type="submit"
          data-game-install-submit-target
          disabled={loading || verifying || games.length === 0}
          animate={
            submitHighlight
              ? {
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    "0 0 0 rgba(34,211,238,0)",
                    "0 0 0 8px rgba(34,211,238,0.35)",
                    "0 0 0 rgba(34,211,238,0)",
                  ],
                }
              : { scale: 1, boxShadow: "0 0 0 rgba(34,211,238,0)" }
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-14 w-full rounded-2xl bg-cyan-500 font-bold text-black transition-colors hover:bg-cyan-400 disabled:opacity-40"
        >
          {loading || verifying ? "در حال ثبت..." : "ثبت سفارش نصب بازی"}
        </motion.button>
      </form>

      <PhoneVerificationModal {...modalProps} />
    </section>
  );
}
