"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginType, setLoginType] = useState<"otp" | "password">("otp");
  const { loginWithPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = () => {
    loginWithPassword("k3", "k3");

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          {mode === "login" ? "ورود" : "ثبت نام"}
        </h1>

        <p className="text-zinc-400 text-center mb-8">
          ورود به حساب کاربری شاپ‌قاب
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 rounded-xl ${mode === "login" ? "bg-cyan-500 text-black" : "bg-white/5"
              }`}
          >
            ورود
          </button>

          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-3 rounded-xl ${mode === "register" ? "bg-cyan-500 text-black" : "bg-white/5"
              }`}
          >
            ثبت نام
          </button>
        </div>

        {/* Login Type */}
        {mode === "login" && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLoginType("otp")}
              className={`flex-1 py-2 rounded-lg text-sm ${loginType === "otp"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-white/5"
                }`}
            >
              کد پیامکی
            </button>

            <button
              onClick={() => setLoginType("password")}
              className={`flex-1 py-2 rounded-lg text-sm ${loginType === "password"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-white/5"
                }`}
            >
              رمز عبور
            </button>
          </div>
        )}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {mode === "register" && (
            <input
              type="text"
              placeholder="نام و نام خانوادگی"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
            />
          )}

          <input
            type="text"
            placeholder="شماره موبایل"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
          />

          {(mode === "register" || loginType === "password") && (
            <input
              type="password"
              placeholder="رمز عبور"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
            />
          )}

          {loginType === "otp" && mode === "login" && (
            <button
              type="button"
              className="w-full bg-white/10 py-3 rounded-xl"
            >
              ارسال کد تایید
            </button>
          )}

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 transition py-3 rounded-xl text-black font-bold"
          >
            {mode === "login" ? "ورود" : "ثبت نام"}
          </button>
        </form>
      </div>
    </main>
  );
}
