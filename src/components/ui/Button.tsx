import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variante = "primario" | "secundario" | "neutro";

const BASE =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-bordo text-white border border-transparent hover:bg-bordo-escuro",
  secundario:
    "bg-superficie text-bordo border border-bordo hover:bg-situacao-atraso-bg",
  neutro:
    "bg-superficie text-texto border border-borda hover:bg-fundo",
};

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

export const Button = forwardRef<HTMLButtonElement, BotaoProps>(
  function Button({ variante = "primario", className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`${BASE} ${VARIANTES[variante]} ${className}`}
        {...props}
      />
    );
  },
);
