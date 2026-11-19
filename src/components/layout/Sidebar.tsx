"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GRUPOS_NAVEGACAO } from "./nav-items";

interface SidebarProps {
  onNavegar?: () => void;
}

export function Sidebar({ onNavegar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu principal"
      className="flex h-full w-62 flex-col gap-5.5 overflow-y-auto bg-bordo px-3.5 py-6 text-white"
    >
      <Link
        href="/"
        onClick={onNavegar}
        className="flex items-center gap-2.5 px-2 text-white"
      >
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-titulo"
        >
          IE
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-titulo text-[19px] leading-none">
            Integrative Equus
          </span>
          <span className="text-[10px] tracking-[0.18em] text-[#d9dbdd] uppercase">
            Medicina equina
          </span>
        </span>
      </Link>

      {GRUPOS_NAVEGACAO.map((grupo, index) => (
        <div key={grupo.titulo ?? index} className="flex flex-col gap-0.5">
          {grupo.titulo && (
            <div className="px-2.5 pb-1.5 text-[11px] tracking-[0.14em] text-[#d9dbdd] uppercase">
              {grupo.titulo}
            </div>
          )}
          {grupo.itens.map((item) => {
            const ativo =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavegar}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-lg px-2.5 text-[15px] text-white ${
                  ativo ? "bg-white/15 font-semibold" : "font-normal"
                } hover:bg-white/10`}
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d={item.icone} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
