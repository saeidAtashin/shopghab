"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { headerNavItems } from "@/lib/site-nav";
import SiteLogo from "../ui/SiteLogo";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* logo */}

          <SiteLogo />

          {/* desktop menu */}

          <nav className="hidden md:flex items-center gap-8">
            {headerNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-300 hover:text-cyan-400 transition"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* mobile button */}

          <button
            onClick={() => setOpen(true)}
            className="md:hidden"
          >
            <Menu />
          </button>
        </div>
      </header>

      {/* mobile sidebar */}

      <div
        className={`fixed inset-0 z-50 transition ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* overlay */}

        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 transition ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* drawer */}

        <div
          className={`absolute right-0 top-0 h-full w-72 bg-[#050816] border-l border-white/10 p-6 transform transition ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-lg">منو</span>

            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {headerNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-zinc-300 hover:text-cyan-400 transition"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
