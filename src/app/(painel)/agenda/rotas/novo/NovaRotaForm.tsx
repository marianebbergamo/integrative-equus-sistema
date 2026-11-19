"use client";

import { useState } from "react";
import { Button, TextField } from "@/components/ui";
import { criarRota } from "../../actions";

interface AtendimentoEspera {
  id: string;
  cliente: string;
  cidade: string;
  servicos: string;
}

interface NovaRotaFormProps {
  regiaoId: string | null;
  atendimentos: AtendimentoEspera[];
}

export function NovaRotaForm({ regiaoId, atendimentos }: NovaRotaFormProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(
    new Set(atendimentos.map((a) => a.id)),
  );
  const criarComRegiao = criarRota.bind(null, regiaoId);

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  return (
    <form action={criarComRegiao} className="flex flex-col gap-4">
      <TextField name="data" label="Data da rota" type="date" required />

      <div className="flex flex-col gap-2.5">
        {atendimentos.map((a, indice) => (
          <div key={a.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-borda p-3">
            <input type="hidden" name="atendimento_id" value={a.id} />
            <label className="flex min-h-11 flex-1 items-center gap-3 text-[15px]">
              <input
                type="checkbox"
                name={`incluir_${a.id}`}
                checked={selecionados.has(a.id)}
                onChange={() => alternar(a.id)}
                className="h-5 w-5 accent-bordo"
              />
              <span>
                <strong>{a.cliente}</strong> · {a.cidade}
                <br />
                <span className="text-sm text-texto-secundario">{a.servicos}</span>
              </span>
            </label>
            <TextField
              name={`horario_${a.id}`}
              label="Horário"
              type="time"
              className="w-28"
            />
            <TextField
              name={`ordem_${a.id}`}
              label="Ordem"
              type="number"
              min="1"
              defaultValue={indice + 1}
              className="w-20"
            />
          </div>
        ))}
        {atendimentos.length === 0 && (
          <p className="text-sm text-texto-secundario">
            Não há atendimentos aprovados aguardando agendamento nesta região.
          </p>
        )}
      </div>

      <div className="mt-2 flex justify-end">
        <Button type="submit" disabled={atendimentos.length === 0}>
          Criar rota
        </Button>
      </div>
    </form>
  );
}
