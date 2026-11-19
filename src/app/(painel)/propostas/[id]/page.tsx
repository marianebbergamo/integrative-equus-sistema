import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, StatusTag, TextField } from "@/components/ui";
import { ItensProposta } from "./ItensProposta";
import { enviarProposta, registrarResposta, salvarRascunho } from "../actions";

const ETAPA_ROTULO: Record<string, string> = {
  orcamento_a_fazer: "1. Orçamento a fazer",
  aguardando_aprovacao: "2. Aguardando aprovação",
  a_agendar: "3. A agendar",
  agendado: "4. Agendado",
  registrar_atendimento: "5. Registrar atendimento",
  a_cobrar: "6. A cobrar",
  aguardando_pagamento: "7. Aguardando pagamento",
  emitir_nota_fiscal: "8. Emitir nota fiscal",
  concluido: "Concluído",
  recusado: "Recusado",
  cancelado: "Cancelado",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PropostaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ animalId?: string }>;
}) {
  const { id } = await params;
  const { animalId } = await searchParams;
  const supabase = await createClient();

  const { data: atendimento } = await supabase
    .from("atendimentos")
    .select("*, clientes(id, nome, telefone), locais(nome, cidade, regiao_id)")
    .eq("id", id)
    .single();

  if (!atendimento) notFound();

  const podeEditar = atendimento.etapa === "orcamento_a_fazer";
  const aguardandoResposta = atendimento.etapa === "aguardando_aprovacao";

  const [
    { data: itens },
    { data: servicos },
    { data: produtos },
    { data: regioes },
    { data: veterinarios },
    { data: statusCadastro },
    { data: animaisDoCliente },
  ] = await Promise.all([
    supabase
      .from("atendimento_itens")
      .select("id, tipo, quantidade, valor_unitario, valor_total, servicos(nome, categoria), produtos(nome_completo)")
      .eq("atendimento_id", id)
      .order("created_at"),
    supabase.from("servicos").select("id, nome, valor").eq("ativo", true).order("nome"),
    supabase.from("produtos").select("id, nome_completo, preco_venda").eq("ativo", true).order("nome_completo"),
    supabase.from("regioes").select("id, nome, valor_deslocamento_km").order("ordem"),
    supabase.from("usuarios").select("id, nome").eq("perfil", "veterinario").eq("ativo", true),
    supabase.from("clientes_cadastro_status").select("*").eq("cliente_id", atendimento.cliente_id).single(),
    supabase.from("animais").select("id, nome, raca, sexo").eq("cliente_id", atendimento.cliente_id).order("nome"),
  ]);

  const salvarRascunhoComId = salvarRascunho.bind(null, id);
  const enviarComId = enviarProposta.bind(null, id);
  const aprovarComId = registrarResposta.bind(null, id, true);
  const recusarComId = registrarResposta.bind(null, id, false);

  const animalSelecionado = animaisDoCliente?.find((a) => a.id === animalId);
  const localNome = atendimento.locais?.nome;

  const deslocamento = (itens ?? [])
    .filter((i) => i.tipo === "deslocamento")
    .reduce((soma, i) => soma + (i.valor_total ?? 0), 0);
  const servicosProdutos = (itens ?? [])
    .filter((i) => i.tipo !== "deslocamento")
    .reduce((soma, i) => soma + (i.valor_total ?? 0), 0);
  const whatsapp = atendimento.clientes?.telefone?.replace(/\D/g, "");

  return (
    <>
      <PageHeader
        titulo="Proposta"
        descricao={undefined}
        acoes={
          <StatusTag situacao={podeEditar ? "atencao" : aguardandoResposta ? "informacao" : "em-dia"}>
            {ETAPA_ROTULO[atendimento.etapa]}
          </StatusTag>
        }
      />
      <div className="-mt-3 text-sm">
        <Link href="/fluxo" className="font-semibold">
          Fluxo
        </Link>
        <span className="text-texto-secundario"> › {ETAPA_ROTULO[atendimento.etapa]}</span>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
          <section className="flex flex-col gap-3.5 rounded-xl border border-borda bg-superficie p-5">
            <h2 className="text-base font-bold">Para quem</h2>
            <div className="text-[15px]">
              <strong>{atendimento.clientes?.nome}</strong>
              {animalSelecionado && ` · ${animalSelecionado.nome}`}
              {localNome && ` · ${localNome}`}
            </div>
            {statusCadastro && (
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  statusCadastro.cadastro_completo
                    ? "bg-situacao-em-dia-bg text-situacao-em-dia-fg"
                    : "bg-situacao-atencao-bg text-situacao-atencao-fg"
                }`}
              >
                {statusCadastro.cadastro_completo
                  ? "Cadastro completo."
                  : "Cadastro incompleto: confira os dados do cliente."}
              </div>
            )}
          </section>

          <ItensProposta
            atendimentoId={id}
            itens={itens ?? []}
            servicos={servicos ?? []}
            produtos={produtos ?? []}
            regioes={regioes ?? []}
            animalId={animalId}
            podeEditar={podeEditar}
          />

          <section className="flex flex-col gap-3.5 rounded-xl border border-borda bg-superficie p-5">
            <h2 className="text-base font-bold">Condições</h2>
            {podeEditar ? (
              <form id="form-condicoes" className="flex flex-col gap-3.5">
                <div className="grid grid-cols-3 gap-3">
                  <TextField
                    name="desconto"
                    label="Desconto (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={atendimento.desconto}
                  />
                  <Select name="validade_dias" label="Validade da proposta" defaultValue="15">
                    <option value="7">7 dias</option>
                    <option value="15">15 dias</option>
                    <option value="30">30 dias</option>
                  </Select>
                  <Select
                    name="veterinario_id"
                    label="Veterinário"
                    defaultValue={atendimento.veterinario_id ?? ""}
                  >
                    <option value="">A definir</option>
                    {(veterinarios ?? []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nome}
                      </option>
                    ))}
                  </Select>
                </div>
                <TextField
                  name="observacoes"
                  label="Observações para o cliente"
                  defaultValue={atendimento.observacoes ?? ""}
                  hint="Aparece no PDF da proposta"
                />
                <div className="flex justify-end">
                  <Button type="submit" variante="secundario" formAction={salvarRascunhoComId}>
                    Salvar rascunho
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="grid grid-cols-3 gap-3 text-[15px]">
                <div>
                  <dt className="text-[13px] text-texto-secundario">Desconto</dt>
                  <dd>{formatarMoeda(atendimento.desconto)}</dd>
                </div>
                <div>
                  <dt className="text-[13px] text-texto-secundario">Validade</dt>
                  <dd>
                    {atendimento.validade_proposta
                      ? new Date(atendimento.validade_proposta + "T00:00:00").toLocaleDateString("pt-BR")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-texto-secundario">Veterinário</dt>
                  <dd>{veterinarios?.find((v) => v.id === atendimento.veterinario_id)?.nome ?? "A definir"}</dd>
                </div>
              </dl>
            )}
          </section>
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-xl border border-borda bg-superficie p-5">
          <h2 className="font-titulo text-[22px] font-normal">Resumo</h2>
          <dl className="flex flex-col gap-2.5 text-[15px]">
            <div className="flex justify-between gap-3">
              <dt className="text-texto-secundario">Serviços e produtos</dt>
              <dd>{formatarMoeda(servicosProdutos)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-texto-secundario">Deslocamento</dt>
              <dd>{formatarMoeda(deslocamento)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-texto-secundario">Desconto</dt>
              <dd>-{formatarMoeda(atendimento.desconto)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-borda pt-3">
              <dt className="font-bold">Total</dt>
              <dd className="font-titulo text-[28px] text-bordo">
                {formatarMoeda(atendimento.total)}
              </dd>
            </div>
          </dl>

          {podeEditar && (
            <>
              <Button
                type="submit"
                form="form-condicoes"
                formAction={enviarComId}
                className="w-full"
              >
                Enviar proposta
              </Button>
              <Link href={`/propostas/${id}/pdf`} target="_blank">
                <Button variante="neutro" className="w-full">
                  Ver prévia do PDF
                </Button>
              </Link>
              <p className="text-sm text-texto-secundario">
                Ao enviar, o cartão vai para a etapa 2, Aguardando aprovação.
              </p>
            </>
          )}

          {aguardandoResposta && (
            <>
              <Link href={`/propostas/${id}/pdf`} target="_blank">
                <Button variante="neutro" className="w-full">
                  Ver PDF da proposta
                </Button>
              </Link>
              {whatsapp && (
                <a
                  href={`https://wa.me/55${whatsapp}?text=${encodeURIComponent(
                    "Olá! Segue a proposta da Integrative Equus. Qualquer dúvida, estou à disposição.",
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variante="secundario" className="w-full">
                    Abrir WhatsApp do cliente
                  </Button>
                </a>
              )}
              <div className="flex gap-2.5">
                <form action={aprovarComId} className="flex-1">
                  <Button type="submit" className="w-full">
                    Cliente aprovou
                  </Button>
                </form>
                <form action={recusarComId} className="flex-1">
                  <Button type="submit" variante="secundario" className="w-full">
                    Cliente recusou
                  </Button>
                </form>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
