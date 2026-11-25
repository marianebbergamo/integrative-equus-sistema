"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GRUPOS_NAVEGACAO, ITEM_CONFIGURACOES, type NavItem } from "./nav-items";

interface SidebarProps {
  ehAdministrador: boolean;
  onNavegar?: () => void;
}

export function Sidebar({ ehAdministrador, onNavegar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu principal"
      className="flex h-full w-62 flex-col gap-5.5 overflow-y-auto bg-bordo px-3.5 py-6 text-white"
    >
      <Link href="/" onClick={onNavegar} className="px-1">
        <Image
          src="/marca/logo-horizontal-negativa.png"
          alt="Integrative Equus — Medicina Equina"
          width={208}
          height={66}
          priority
        />
      </Link>

      {GRUPOS_NAVEGACAO.map((grupo, index) => (
        <div key={grupo.titulo ?? index} className="flex flex-col gap-0.5">
          {grupo.titulo && (
            <div className="px-2.5 pb-1.5 text-[11px] tracking-[0.14em] text-[#d9dbdd] uppercase">
              {grupo.titulo}
            </div>
          )}
          {grupo.itens.map((item) => (
            <ItemMenu
              key={item.href}
              item={item}
              pathname={pathname}
              onNavegar={onNavegar}
            />
          ))}
        </div>
      ))}

      {ehAdministrador && (
        <div className="mt-auto flex flex-col border-t border-white/15 pt-4">
          <ItemMenu
            item={ITEM_CONFIGURACOES}
            pathname={pathname}
            onNavegar={onNavegar}
          />
        </div>
      )}
    </nav>
  );
}

function ItemMenu({
  item,
  pathname,
  onNavegar,
}: {
  item: NavItem;
  pathname: string;
  onNavegar?: () => void;
}) {
  const ativo =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <Link
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
}
