"use client";

import { useTransition } from "react";
import { toggleItemRealizado } from "../../actions";

interface ItemPrevisto {
  id: string;
  nome: string;
  valor: number;
  realizado: boolean;
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ChecklistPrevistos({
  atendimentoId,
  itens,
}: {
  atendimentoId: string;
  itens: ItemPrevisto[];
}) {
  const [, iniciar] = useTransition();

  return (
    <div className="flex flex-col gap-0.5">
      {itens.map((item) => (
        <label
          key={item.id}
          className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-[#eee8e0] text-[15px] first:border-t-0"
        >
          <input
            type="checkbox"
            defaultChecked={item.realizado}
            onChange={(e) =>
              iniciar(() => toggleItemRealizado(atendimentoId, item.id, e.target.checked))
            }
            className="h-5 w-5 accent-bordo"
          />
          <span className="flex-1">{item.nome}</span>
          <span className="font-semibold">{formatarMoeda(item.valor)}</span>
        </label>
      ))}
      {itens.length === 0 && (
        <p className="text-sm text-texto-secundario">Nada previsto na proposta.</p>
      )}
    </div>
  );
}
