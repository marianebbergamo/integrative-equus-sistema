import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function formatarPrazo(dataPrevista: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.round(
    (new Date(dataPrevista + "T00:00:00").getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (dias < 0) return `${Math.abs(dias)} dia${Math.abs(dias) === 1 ? "" : "s"} em atraso`;
  if (dias === 0) return "hoje";
  return `em ${dias} dia${dias === 1 ? "" : "s"}`;
}

export default async function InicioPage() {
  const supabase = await createClient();
  const agora = new Date();
  const hoje = agora.toISOString().slice(0, 10);
  const inicioMesIso = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().slice(0, 10);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: usuario },
    { data: atendimentosEtapas },
    { data: cobrancas },
    { data: rotaHoje },
    { data: produtos },
    { data: retornos },
  ] = await Promise.all([
    user
      ? supabase.from("usuarios").select("nome").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("atendimentos").select("id, etapa"),
    supabase
      .from("cobrancas")
      .select("valor, situacao, vencimento, data_pagamento, atendimentos(etapa)"),
    supabase
      .from("rotas")
      .select(
        "id, ponto_partida, km_previstos, regioes(nome), rota_paradas(ordem, horario_previsto, atendimentos(clientes(nome), usuarios(nome), locais(cidade), atendimento_itens(servicos(nome), animais(nome))))",
      )
      .eq("data", hoje)
      .maybeSingle(),
    supabase
      .from("produtos")
      .select("id, nome_completo, estoque_minimo, estoque_lotes(quantidade)")
      .eq("ativo", true),
    supabase
      .from("retornos")
      .select("data_prevista, animais(nome, clientes(nome)), servicos(nome)")
      .eq("situacao", "a_vencer")
      .order("data_prevista")
      .limit(5),
  ]);

  const contarEtapa = (etapa: string) =>
    (atendimentosEtapas ?? []).filter((a) => a.etapa === etapa).length;

  const cobrancasEmAtraso = (cobrancas ?? []).filter(
    (c) => c.situacao !== "paga" && c.vencimento && c.vencimento < hoje,
  );
  const recebidoMes = (cobrancas ?? [])
    .filter((c) => c.situacao === "paga" && c.data_pagamento && c.data_pagamento >= inicioMesIso)
    .reduce((soma, c) => soma + c.valor, 0);
  const aReceber = (cobrancas ?? [])
    .filter(
      (c) =>
        c.atendimentos &&
        ["a_cobrar", "aguardando_pagamento"].includes(c.atendimentos.etapa) &&
        c.situacao !== "paga",
    )
    .reduce((soma, c) => soma + c.valor, 0);

  const alerts = [
    {
      n: contarEtapa("orcamento_a_fazer"),
      label: "Orçamentos a fazer",
      href: "/fluxo",
      cor: "text-texto",
    },
    {
      n: contarEtapa("aguardando_aprovacao"),
      label: "Aguardando aprovação",
      href: "/fluxo",
      cor: "text-texto",
    },
    { n: contarEtapa("a_agendar"), label: "A agendar", href: "/agenda", cor: "text-texto" },
    {
      n: contarEtapa("registrar_atendimento"),
      label: "Atendimento sem ficha",
      href: "/fichas",
      cor: "text-bordo",
    },
    { n: contarEtapa("a_cobrar"), label: "A cobrar", href: "/financeiro?aba=cobrar", cor: "text-texto" },
    {
      n: cobrancasEmAtraso.length,
      label: "Pagamentos em atraso",
      href: "/financeiro?aba=atraso",
      cor: "text-bordo",
    },
  ];

  const produtosAbaixoDoMinimo = (produtos ?? [])
    .map((p) => ({
      id: p.id,
      nome: p.nome_completo ?? "Produto",
      emEstoque: (p.estoque_lotes ?? []).reduce((soma, l) => soma + l.quantidade, 0),
      minimo: p.estoque_minimo,
    }))
    .filter((p) => p.emEstoque < p.minimo)
    .slice(0, 5);

  const paradasHoje = [...(rotaHoje?.rota_paradas ?? [])].sort((a, b) => a.ordem - b.ordem);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold tracking-[0.14em] text-bordo uppercase">
            {agora.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </div>
          <h1 className="font-titulo text-[36px] leading-[1.1] font-normal text-texto">
            {saudacao(agora.getHours())}, {usuario?.nome ?? "Fabi"}.
          </h1>
        </div>
        <Link href="/propostas/novo">
          <Button>Novo pedido de orçamento</Button>
        </Link>
      </header>

      <section aria-label="Pendências" className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-titulo text-[22px] font-normal">O que precisa de você</h2>
          <Link href="/fluxo" className="text-sm font-semibold">
            Ver o fluxo completo
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(165px,100%),1fr))] gap-3.5">
          {alerts.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col gap-1 rounded-xl border border-borda bg-superficie p-4.5 no-underline"
            >
              <span className={`font-titulo text-[40px] leading-none ${a.cor}`}>{a.n}</span>
              <span className="mt-1.5 text-[15px] font-semibold text-texto">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] items-start gap-5">
        <section className="flex flex-col gap-4 rounded-xl border border-borda bg-superficie p-5.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-titulo text-[22px] font-normal">
                Rota de hoje{rotaHoje?.regioes?.nome ? ` · ${rotaHoje.regioes.nome}` : ""}
              </h2>
              <div className="text-sm text-texto-secundario">
                {rotaHoje
                  ? `${paradasHoje.length} parada${paradasHoje.length === 1 ? "" : "s"}${
                      rotaHoje.km_previstos ? ` · ${rotaHoje.km_previstos} km previstos` : ""
                    }`
                  : "Sem rota marcada para hoje"}
              </div>
            </div>
            <Link href="/agenda" className="text-sm font-semibold">
              Abrir agenda
            </Link>
          </div>
          <ol className="m-0 flex list-none flex-col p-0">
            {paradasHoje.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-4 border-t border-[#eee8e0] py-3.5 first:border-t-0"
              >
                <div className="w-13 flex-none font-titulo text-xl text-bordo">
                  {p.horario_previsto?.slice(0, 5) ?? "—"}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="text-[15px] font-semibold">
                    {p.atendimentos?.locais?.cidade}{" "}
                    <span className="font-normal text-texto-secundario">
                      · {p.atendimentos?.clientes?.nome}
                    </span>
                  </div>
                  <div className="text-sm text-[#4A4546]">
                    {Array.from(
                      new Set(
                        p.atendimentos?.atendimento_itens
                          ?.map((it) => it.animais?.nome)
                          .filter((n): n is string => Boolean(n)),
                      ),
                    ).join(", ")}{" "}
                    ·{" "}
                    {Array.from(
                      new Set(
                        p.atendimentos?.atendimento_itens
                          ?.map((it) => it.servicos?.nome)
                          .filter((n): n is string => Boolean(n)),
                      ),
                    ).join(", ")}
                  </div>
                </div>
                <span className="flex-none rounded-full bg-[#EEEAE4] px-2.5 py-1 text-xs font-semibold text-[#4A4546]">
                  {p.atendimentos?.usuarios?.nome}
                </span>
              </li>
            ))}
            {paradasHoje.length === 0 && (
              <p className="text-sm text-texto-secundario">Nenhum atendimento programado para hoje.</p>
            )}
          </ol>
          <Link href="/fichas">
            <Button variante="secundario">Registrar atendimento</Button>
          </Link>
        </section>

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-xl border border-borda bg-superficie p-5.5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-titulo text-[22px] font-normal">
                Financeiro de{" "}
                {agora.toLocaleDateString("pt-BR", { month: "long" })}
              </h2>
              <Link href="/financeiro" className="text-sm font-semibold">
                Ver cobranças
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-texto-secundario">Recebido</span>
                <span className="font-titulo text-2xl text-situacao-em-dia-fg">
                  {formatarMoeda(recebidoMes)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-texto-secundario">A receber</span>
                <span className="font-titulo text-2xl">{formatarMoeda(aReceber)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-texto-secundario">Em atraso</span>
                <span className="font-titulo text-2xl text-bordo">
                  {formatarMoeda(cobrancasEmAtraso.reduce((s, c) => s + c.valor, 0))}
                </span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-borda bg-superficie p-5.5">
            <h2 className="font-titulo text-[22px] font-normal">Estoque abaixo do mínimo</h2>
            <ul className="m-0 flex list-none flex-col p-0">
              {produtosAbaixoDoMinimo.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between gap-3 border-t border-[#eee8e0] py-2.5 text-sm first:border-t-0"
                >
                  <span className="font-semibold">{p.nome}</span>
                  <span className="font-semibold text-bordo">
                    {p.emEstoque}{" "}
                    <span className="font-normal text-texto-secundario">· mín. {p.minimo}</span>
                  </span>
                </li>
              ))}
              {produtosAbaixoDoMinimo.length === 0 && (
                <p className="text-sm text-texto-secundario">Tudo em dia.</p>
              )}
            </ul>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-borda bg-superficie p-5.5">
            <h2 className="font-titulo text-[22px] font-normal">Retornos a vencer</h2>
            <ul className="m-0 flex list-none flex-col p-0">
              {(retornos ?? []).map((r, i) => (
                <li
                  key={i}
                  className="flex justify-between gap-3 border-t border-[#eee8e0] py-2.5 text-sm first:border-t-0"
                >
                  <span>
                    <span className="font-semibold">{r.animais?.nome}</span>
                    {r.servicos?.nome ? ` · ${r.servicos.nome}` : ""}
                    <br />
                    <span className="text-texto-secundario">{r.animais?.clientes?.nome}</span>
                  </span>
                  <span className="flex-none font-semibold text-situacao-atencao-fg">
                    {formatarPrazo(r.data_prevista)}
                  </span>
                </li>
              ))}
              {(retornos ?? []).length === 0 && (
                <p className="text-sm text-texto-secundario">Nenhum retorno a vencer.</p>
              )}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
