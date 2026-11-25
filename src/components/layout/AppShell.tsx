"use client";

import Image from "next/image";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { SairButton } from "./SairButton";

interface AppShellProps {
  emailUsuario: string;
  children: React.ReactNode;
}

export function AppShell({ emailUsuario, children }: AppShellProps) {
  const [gavetaAberta, setGavetaAberta] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {gavetaAberta && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setGavetaAberta(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative z-50 h-full w-62 max-w-[85vw] shadow-xl">
            <Sidebar onNavegar={() => setGavetaAberta(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-borda bg-superficie px-4 md:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setGavetaAberta(true)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-texto"
          >
            <svg
              aria-hidden
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image
            src="/marca/logo-horizontal.png"
            alt="Integrative Equus — Medicina Equina"
            width={200}
            height={63}
            priority
          />
          <span className="w-11" aria-hidden />
        </header>

        <div className="hidden min-h-14 items-center justify-end gap-3 border-b border-borda bg-superficie px-6 md:flex">
          <span className="text-sm text-texto-secundario">{emailUsuario}</span>
          <SairButton />
        </div>

        <main className="flex flex-1 flex-col gap-5.5 p-4 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
