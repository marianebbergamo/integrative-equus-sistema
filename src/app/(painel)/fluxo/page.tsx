import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, PageHeader } from "@/components/ui";
import type { Database } from "@/types/database";

type EtapaAtendimento = Database["public"]["Enums"]["etapa_atendimento"];

const COLUNAS: {
  etapa: EtapaAtendimento;
  numero: number;
  nome: string;
  acao: string;
  href: (id: string) => string;
}[] = [
  { etapa: "orcamento_a_fazer", numero: 1, nome: "Orçamento a fazer", acao: "Montar proposta", href: (id) => `/propostas/${id}` },
  { etapa: "aguardando_aprovacao", numero: 2, nome: "Aguardando aprovação", acao: "Registrar resposta", href: (id) => `/propostas/${id}` },
  { etapa: "a_agendar", numero: 3, nome: "A agendar", acao: "Agendar", href: () => `/agenda` },
  { etapa: "agendado", numero: 4, nome: "Agendado", acao: "Ver na agenda", href: () => `/agenda` },
  { etapa: "registrar_atendimento", numero: 5, nome: "Registrar atendimento", acao: "Preencher ficha e fechar", href: () => `/fichas` },
  { etapa: "a_cobrar", numero: 6, nome: "A cobrar", acao: "Enviar cobrança", href: () => `/financeiro` },
  { etapa: "aguardando_pagamento", numero: 7, nome: "Aguardando pagamento", acao: "Confirmar recebimento", href: () => `/financeiro` },
  { etapa: "emitir_nota_fiscal", numero: 8, nome: "Emitir nota fiscal", acao: "Emitir NF", href: () => `/notas-fiscais` },
];

const FASES = [
  { nome: "Comercial e agenda", quem: "Fabi e Bruno", etapas: ["orcamento_a_fazer", "aguardando_aprovacao", "a_agendar", "agendado"] },
  { nome: "Atendimento e financeiro", quem: "Veterinário fecha, financeiro cobra", etapas: ["registrar_atendimento", "a_cobrar", "aguardando_pagamento", "emitir_nota_fiscal"] },
];

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function tempoRelativo(data: string) {
  const dias = Math.floor((Date.now() - new Date(data).getTime()) / (24 * 60 * 60 * 1000));
  if (dias <= 0) return { texto: "hoje", atrasado: false };
  if (dias === 1) return { texto: "há 1 dia", atrasado: false };
  return { texto: `há ${dias} dias`, atrasado: dias > 3 };
}

export default async function FluxoPage({
  searchParams,
}: {
  searchParams: Promise<{ vet?: string }>;
}) {
  const { vet } = await searchParams;
  const supabase = await createClient();

  const { data: veterinarios } = await supabase
    .from("usuarios")
    .select("id, nome")
    .eq("perfil", "veterinario")
    .eq("ativo", true)
    .order("nome");

  const etapasAbertas = COLUNAS.map((c) => c.etapa);

  let consulta = supabase
    .from("atendimentos")
    .select("id, etapa, total, updated_at, created_at, clientes(nome), locais(cidade)")
    .in("etapa", etapasAbertas)
    .order("created_at");

  if (vet) {
    consulta = consulta.eq("veterinario_id", vet);
  }

  const { data: atendimentos, error } = await consulta;

  if (error) {
    throw new Error("Não foi possível carregar o fluxo: " + error.message);
  }

  const ids = (atendimentos ?? []).map((a) => a.id);
  const { data: itens } = ids.length
    ? await supabase
        .from("atendimento_itens")
        .select("atendimento_id, tipo, servicos(nome), animais(nome)")
        .in("atendimento_id", ids)
    : { data: [] };

  const infoPorAtendimento = new Map<string, { animal: string; servico: string }>();
  for (const id of ids) {
    const itensDoAtendimento = (itens ?? []).filter((i) => i.atendimento_id === id);
    const animaisDistintos = Array.from(
      new Set(itensDoAtendimento.map((i) => i.animais?.nome).filter((n): n is string => Boolean(n))),
    );
    const servicosDistintos = Array.from(
      new Set(
        itensDoAtendimento
          .filter((i) => i.tipo === "servico")
          .map((i) => i.servicos?.nome)
          .filter((n): n is string => Boolean(n)),
      ),
    );
    infoPorAtendimento.set(id, {
      animal:
        animaisDistintos.length === 1
          ? animaisDistintos[0]
          : animaisDistintos.length > 1
            ? `${animaisDistintos.length} animais`
            : "—",
      servico: servicosDistintos.join(", ") || "sem itens ainda",
    });
  }

  return (
    <>
      <PageHeader
        titulo="Fluxo"
        descricao="Cada atendimento é um cartão que anda da esquerda para a direita. Nada sai de uma etapa sem a ação dela."
        acoes={
          <>
            <div role="group" aria-label="Filtrar por veterinário" className="flex gap-1.5">
              <Link
                href="/fluxo"
                className={`flex h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                  !vet ? "border-texto bg-texto text-white" : "border-[#cfc8bf] bg-superficie text-texto"
                }`}
              >
                Todos
              </Link>
              {(veterinarios ?? []).map((v) => (
                <Link
                  key={v.id}
                  href={`/fluxo?vet=${v.id}`}
                  className={`flex h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                    vet === v.id ? "border-texto bg-texto text-white" : "border-[#cfc8bf] bg-superficie text-texto"
                  }`}
                >
                  {v.nome}
                </Link>
              ))}
            </div>
            <Link href="/propostas/novo">
              <Button>Novo pedido de orçamento</Button>
            </Link>
          </>
        }
      />

      {FASES.map((fase) => (
        <section key={fase.nome} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h2 className="text-xs font-bold tracking-[0.14em] text-bordo uppercase">{fase.nome}</h2>
            <span className="text-[13px] text-texto-secundario">{fase.quem}</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] items-start gap-3.5">
            {COLUNAS.filter((c) => fase.etapas.includes(c.etapa)).map((coluna) => {
              const cards = (atendimentos ?? []).filter((a) => a.etapa === coluna.etapa);
              return (
                <div key={coluna.etapa} className="flex flex-col gap-2.5 rounded-xl bg-[#EFE9E1] p-3">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="text-[15px] font-bold">
                      {coluna.numero}. {coluna.nome}
                    </div>
                    <span className="min-w-[26px] rounded-full bg-white px-2 py-0.5 text-center text-[13px] font-bold">
                      {cards.length}
                    </span>
                  </div>
                  {cards.map((c) => {
                    const info = infoPorAtendimento.get(c.id)!;
                    const tempo = tempoRelativo(c.updated_at);
                    return (
                      <article
                        key={c.id}
                        className="flex flex-col gap-2 rounded-[10px] border border-borda bg-superficie p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[15px] leading-[1.25] font-semibold">
                            {c.clientes?.nome}
                          </div>
                          <div className="flex-none text-sm font-semibold">
                            {c.total > 0 ? formatarMoeda(c.total) : "a definir"}
                          </div>
                        </div>
                        <div className="text-[13px] leading-[1.4] text-[#4A4546]">
                          {info.animal} · {info.servico}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full bg-situacao-informacao-bg px-2.5 py-0.5 text-xs font-semibold text-situacao-informacao-fg">
                            {c.locais?.cidade ?? "—"}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              tempo.atrasado ? "text-bordo" : "text-texto-secundario"
                            }`}
                          >
                            {tempo.texto}
                          </span>
                        </div>
                        <Link
                          href={coluna.href(c.id)}
                          className="flex min-h-11 items-center justify-center rounded-lg border border-bordo text-sm font-semibold text-bordo"
                        >
                          {coluna.acao}
                        </Link>
                      </article>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-[13px] text-texto-secundario">
        Atendimento direto (emergência ou cliente de confiança) entra já na etapa 5, sem proposta.
      </p>
    </>
  );
}
