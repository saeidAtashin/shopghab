"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getPostLoginPath } from "@/lib/auth-shared";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();

  const router = useRouter();

  const [name, setName] = useState("");

  const handleRegister = () => {
    register(name);
    router.replace(getPostLoginPath("user"));
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">ثبت نام</h1>

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3"
          />

          <button
            onClick={handleRegister}
            className="w-full bg-cyan-500 text-black font-bold py-3 rounded-xl"
          >
            ثبت نام
          </button>
        </div>
      </div>
    </main>
  );
}
