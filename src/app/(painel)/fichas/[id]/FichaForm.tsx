"use client";

import { useState } from "react";
import { Button, Select, TextField } from "@/components/ui";
import { enviarParaFechamento } from "../actions";

interface TipoFicha {
  id: string;
  nome: string;
}

interface ItemProcedimento {
  id: string;
  nome: string;
  origem: string;
  realizado: boolean;
}

interface FichaFormProps {
  atendimentoId: string;
  animalId: string;
  tipos: TipoFicha[];
  fichaModeloIdAtual: string | null;
  queixaAtual: string;
  procedimentos: ItemProcedimento[];
  orientacoesAtual: string;
  retornoDiasAtual: number | null;
}

export function FichaForm({
  atendimentoId,
  animalId,
  tipos,
  fichaModeloIdAtual,
  queixaAtual,
  procedimentos,
  orientacoesAtual,
  retornoDiasAtual,
}: FichaFormProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState(fichaModeloIdAtual ?? "");
  const enviarComIds = enviarParaFechamento.bind(null, atendimentoId, animalId);

  return (
    <form action={enviarComIds} className="flex flex-1 flex-col gap-4.5">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-bold">Tipo de ficha</div>
        <input type="hidden" name="ficha_modelo_id" value={tipoSelecionado} />
        <div role="group" aria-label="Tipo de ficha" className="flex flex-wrap gap-1.5">
          {tipos.map((t) => {
            const ativo = t.id === tipoSelecionado;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipoSelecionado(t.id)}
                className={`h-11 cursor-pointer rounded-full border px-3.5 text-sm font-semibold ${
                  ativo ? "border-texto bg-texto text-white" : "border-[#cfc8bf] bg-superficie text-texto"
                }`}
              >
                {t.nome}
              </button>
            );
          })}
        </div>
      </div>

      <TextField
        name="queixa"
        label="Queixa ou motivo do atendimento"
        defaultValue={queixaAtual}
        placeholder="Toque para escrever"
      />

      <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
        <legend className="mb-1.5 p-0 text-sm font-bold">Procedimentos</legend>
        {procedimentos.map((p) => (
          <label key={p.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
            <input type="hidden" name="item_id" value={p.id} />
            <input
              type="checkbox"
              name={`realizado_${p.id}`}
              defaultChecked={p.realizado}
              className="h-5 w-5 accent-bordo"
            />
            <span className="flex-1">{p.nome}</span>
            <span className="text-xs text-texto-secundario">
              {p.origem === "extra" ? "extra" : "da proposta"}
            </span>
          </label>
        ))}
        {procedimentos.length === 0 && (
          <p className="text-sm text-texto-secundario">Nenhum serviço para este animal.</p>
        )}
      </fieldset>

      <TextField
        name="orientacoes_tutor"
        label="Orientações ao tutor"
        defaultValue={orientacoesAtual}
        hint="Vai para o relatório do cliente"
      />

      <Select
        name="retorno_dias"
        label="Retorno sugerido"
        defaultValue={retornoDiasAtual ? String(retornoDiasAtual) : ""}
      >
        <option value="">Sem retorno</option>
        <option value="30">Em 30 dias</option>
        <option value="60">Em 60 dias</option>
        <option value="90">Em 90 dias</option>
      </Select>

      <div className="mt-auto flex flex-col gap-2">
        <Button type="submit" className="min-h-13 text-[17px]">
          Salvar e ir para o fechamento
        </Button>
        <p className="text-center text-xs text-texto-secundario">
          Salva sozinha a cada envio, mesmo sem sinal.
        </p>
      </div>
    </form>
  );
}
