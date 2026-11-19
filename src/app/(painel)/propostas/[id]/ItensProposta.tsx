"use client";

import { useState } from "react";
import { Button, Select, Table, TableHead, TableRow, Th, Td, TextField } from "@/components/ui";
import { adicionarItem, removerItem } from "../actions";

interface Item {
  id: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number | null;
  servicos: { nome: string; categoria: string | null } | null;
  produtos: { nome_completo: string | null } | null;
}

interface ItensPropostaProps {
  atendimentoId: string;
  itens: Item[];
  servicos: { id: string; nome: string; valor: number }[];
  produtos: { id: string; nome_completo: string | null; preco_venda: number }[];
  regioes: { id: string; nome: string; valor_deslocamento_km: number }[];
  animalId?: string;
  podeEditar: boolean;
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function nomeItem(item: Item) {
  if (item.tipo === "servico") return item.servicos?.nome ?? "Serviço";
  if (item.tipo === "produto") return item.produtos?.nome_completo ?? "Produto";
  return "Deslocamento";
}

function infoItem(item: Item) {
  if (item.tipo === "servico") return item.servicos?.categoria ?? "";
  if (item.tipo === "deslocamento") return `${item.quantidade} km`;
  return "";
}

export function ItensProposta({
  atendimentoId,
  itens,
  servicos,
  produtos,
  regioes,
  animalId,
  podeEditar,
}: ItensPropostaProps) {
  const [formAberto, setFormAberto] = useState<"servico" | "produto" | "deslocamento" | null>(
    null,
  );
  const adicionarComId = adicionarItem.bind(null, atendimentoId);
  const removerComId = removerItem.bind(null, atendimentoId);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-borda bg-superficie p-5">
      <h2 className="text-base font-bold">Serviços e produtos</h2>

      <Table>
        <TableHead>
          <tr>
            <Th>Item</Th>
            <Th>Qtd.</Th>
            <Th className="text-right">Valor</Th>
            <Th className="text-right">Subtotal</Th>
            {podeEditar && <Th />}
          </tr>
        </TableHead>
        <tbody>
          {itens.map((item) => (
            <TableRow key={item.id}>
              <Td>
                {nomeItem(item)}
                {infoItem(item) && (
                  <>
                    <br />
                    <span className="text-xs text-texto-secundario">{infoItem(item)}</span>
                  </>
                )}
              </Td>
              <Td>{item.quantidade}</Td>
              <Td className="text-right whitespace-nowrap">{formatarMoeda(item.valor_unitario)}</Td>
              <Td className="text-right font-semibold whitespace-nowrap">
                {formatarMoeda(item.valor_total ?? 0)}
              </Td>
              {podeEditar && (
                <Td>
                  <form action={removerComId.bind(null, item.id)}>
                    <button
                      type="submit"
                      aria-label="Remover item"
                      className="flex h-11 w-11 cursor-pointer items-center justify-center text-xl text-texto-secundario"
                    >
                      ×
                    </button>
                  </form>
                </Td>
              )}
            </TableRow>
          ))}
          {itens.length === 0 && (
            <TableRow>
              <Td colSpan={podeEditar ? 5 : 4} className="text-center text-texto-secundario">
                Nenhum item adicionado ainda.
              </Td>
            </TableRow>
          )}
        </tbody>
      </Table>

      {podeEditar && (
        <>
          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              variante="secundario"
              className="border-dashed"
              onClick={() => setFormAberto(formAberto === "servico" ? null : "servico")}
            >
              Adicionar serviço
            </Button>
            <Button
              type="button"
              variante="secundario"
              className="border-dashed"
              onClick={() => setFormAberto(formAberto === "produto" ? null : "produto")}
            >
              Adicionar produto
            </Button>
            <Button
              type="button"
              variante="secundario"
              className="border-dashed"
              onClick={() => setFormAberto(formAberto === "deslocamento" ? null : "deslocamento")}
            >
              Adicionar deslocamento
            </Button>
          </div>

          {formAberto === "servico" && (
            <form
              action={adicionarComId}
              className="flex flex-wrap items-end gap-3 rounded-lg bg-fundo p-3"
            >
              <input type="hidden" name="tipo" value="servico" />
              {animalId && <input type="hidden" name="animal_id" value={animalId} />}
              <Select name="servico_id" label="Serviço" required className="min-w-50">
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} · {formatarMoeda(s.valor)}
                  </option>
                ))}
              </Select>
              <TextField
                name="quantidade"
                label="Qtd."
                type="number"
                min="1"
                defaultValue="1"
                className="w-20"
              />
              <Button type="submit">Adicionar</Button>
            </form>
          )}

          {formAberto === "produto" && (
            <form
              action={adicionarComId}
              className="flex flex-wrap items-end gap-3 rounded-lg bg-fundo p-3"
            >
              <input type="hidden" name="tipo" value="produto" />
              {animalId && <input type="hidden" name="animal_id" value={animalId} />}
              <Select name="produto_id" label="Produto" required className="min-w-50">
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome_completo} · {formatarMoeda(p.preco_venda)}
                  </option>
                ))}
              </Select>
              <TextField
                name="quantidade"
                label="Qtd."
                type="number"
                min="1"
                defaultValue="1"
                className="w-20"
              />
              <Button type="submit">Adicionar</Button>
            </form>
          )}

          {formAberto === "deslocamento" && (
            <form
              action={adicionarComId}
              className="flex flex-wrap items-end gap-3 rounded-lg bg-fundo p-3"
            >
              <input type="hidden" name="tipo" value="deslocamento" />
              <Select name="regiao_id" label="Região" required className="min-w-50">
                {regioes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome} · {formatarMoeda(r.valor_deslocamento_km)}/km
                  </option>
                ))}
              </Select>
              <TextField
                name="quantidade"
                label="Km"
                type="number"
                min="1"
                step="0.1"
                defaultValue="1"
                className="w-24"
              />
              <Button type="submit">Adicionar</Button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
