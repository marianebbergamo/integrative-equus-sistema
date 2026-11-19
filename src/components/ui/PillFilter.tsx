"use client";

interface PillFilterProps {
  opcoes: string[];
  selecionado: string;
  onSelecionar: (opcao: string) => void;
  "aria-label"?: string;
}

export function PillFilter({
  opcoes,
  selecionado,
  onSelecionar,
  "aria-label": ariaLabel = "Filtros",
}: PillFilterProps) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {opcoes.map((opcao) => {
        const ativo = opcao === selecionado;
        return (
          <button
            key={opcao}
            type="button"
            onClick={() => onSelecionar(opcao)}
            aria-pressed={ativo}
            className={`h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold ${
              ativo
                ? "border-texto bg-texto text-white"
                : "border-[#cfc8bf] bg-superficie text-texto hover:bg-fundo"
            }`}
          >
            {opcao}
          </button>
        );
      })}
    </div>
  );
}
