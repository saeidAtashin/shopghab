"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

export default function NavSearch({ className, onNavigate }: Props) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = value.trim();
    onNavigate?.();
    router.push(q ? `/designs?q=${encodeURIComponent(q)}` : "/designs");
  }

  return (
    <form role="search" onSubmit={submit} className={cn("min-w-0", className)}>
      <label htmlFor={inputId} className="sr-only">
        جستجوی طرح‌ها
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA3B8]"
          aria-hidden
        />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="جستجوی طرح‌ها"
          className="h-10 w-full rounded-xl border border-white/10 bg-[#10192B] ps-10 pe-3 text-sm text-[#F4F5FA] outline-none placeholder:text-[#9AA3B8] focus:border-[#5145FF]"
        />
      </div>
    </form>
  );
}
