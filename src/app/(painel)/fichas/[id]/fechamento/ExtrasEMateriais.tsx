"use client";

import { useState } from "react";
import { Button, Select, TextField } from "@/components/ui";
import { adicionarItemExtra, removerItemFechamento } from "../../actions";

interface ItemExtra {
  id: string;
  nome: string;
  valor: number;
}

interface ItemMaterial {
  id: string;
  nome: string;
  quantidade: number;
  cobrar: boolean;
  valor: number;
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ServicosExtras({
  atendimentoId,
  itens,
  servicos,
}: {
  atendimentoId: string;
  itens: ItemExtra[];
  servicos: { id: string; nome: string; valor: number }[];
}) {
  const [aberto, setAberto] = useState(false);
  const adicionarComId = adicionarItemExtra.bind(null, atendimentoId);
  const removerComId = removerItemFechamento.bind(null, atendimentoId);

  return (
    <section className="flex flex-col gap-2.5 rounded-xl border border-borda bg-superficie p-5">
      <h2 className="text-base font-bold">Serviços extras realizados</h2>
      <p className="text-sm text-texto-secundario">O que foi feito além da proposta.</p>
      {itens.map((item) => (
        <div
          key={item.id}
          className="flex min-h-11 items-center gap-3 border-t border-[#eee8e0] text-[15px]"
        >
          <span className="flex-1">{item.nome}</span>
          <span className="font-semibold">{formatarMoeda(item.valor)}</span>
          <form action={removerComId.bind(null, item.id)}>
            <button
              type="submit"
              aria-label="Remover serviço"
              className="flex h-11 w-11 cursor-pointer items-center justify-center text-xl text-texto-secundario"
            >
              ×
            </button>
          </form>
        </div>
      ))}
      <Button
        type="button"
        variante="secundario"
        className="self-start border-dashed"
        onClick={() => setAberto(!aberto)}
      >
        Adicionar serviço do catálogo
      </Button>
      {aberto && (
        <form action={adicionarComId} className="flex flex-wrap items-end gap-3 rounded-lg bg-fundo p-3">
          <input type="hidden" name="tipo" value="servico" />
          <Select name="servico_id" label="Serviço" required className="min-w-50">
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome} · {formatarMoeda(s.valor)}
              </option>
            ))}
          </Select>
          <TextField name="quantidade" label="Qtd." type="number" min="1" defaultValue="1" className="w-20" />
          <Button type="submit">Adicionar</Button>
        </form>
      )}
    </section>
  );
}

export function MateriaisUsados({
  atendimentoId,
  itens,
  produtos,
}: {
  atendimentoId: string;
  itens: ItemMaterial[];
  produtos: { id: string; nome_completo: string | null; preco_venda: number }[];
}) {
  const [aberto, setAberto] = useState(false);
  const adicionarComId = adicionarItemExtra.bind(null, atendimentoId);
  const removerComId = removerItemFechamento.bind(null, atendimentoId);

  return (
    <section className="flex flex-col gap-2.5 rounded-xl border border-borda bg-superficie p-5">
      <h2 className="text-base font-bold">Materiais e medicamentos usados</h2>
      <p className="text-sm text-texto-secundario">
        Entram na cobrança quando marcados para cobrar do cliente.
      </p>
      <div className="flex flex-col">
        {itens.map((item) => (
          <div
            key={item.id}
            className="flex min-h-11 items-center gap-3 border-t border-[#eee8e0] text-[15px]"
          >
            <span className="flex-1">{item.nome}</span>
            <span className="text-sm text-texto-secundario">{item.quantidade}</span>
            <span className="font-semibold">{item.cobrar ? formatarMoeda(item.valor) : "não cobrado"}</span>
            <form action={removerComId.bind(null, item.id)}>
              <button
                type="submit"
                aria-label="Remover produto"
                className="flex h-11 w-11 cursor-pointer items-center justify-center text-xl text-texto-secundario"
              >
                ×
              </button>
            </form>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variante="secundario"
        className="self-start border-dashed"
        onClick={() => setAberto(!aberto)}
      >
        Adicionar produto
      </Button>
      {aberto && (
        <form action={adicionarComId} className="flex flex-wrap items-end gap-3 rounded-lg bg-fundo p-3">
          <input type="hidden" name="tipo" value="produto" />
          <Select name="produto_id" label="Produto" required className="min-w-50">
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_completo} · {formatarMoeda(p.preco_venda)}
              </option>
            ))}
          </Select>
          <TextField name="quantidade" label="Qtd." type="number" min="1" defaultValue="1" className="w-20" />
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" name="cobrar" defaultChecked className="h-5 w-5 accent-bordo" />
            Cobrar
          </label>
          <Button type="submit">Adicionar</Button>
        </form>
      )}
    </section>
  );
}
