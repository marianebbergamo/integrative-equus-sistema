import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Button,
  Card,
  PageHeader,
  StatusTag,
  Table,
  TableHead,
  TableRow,
  Th,
  Td,
} from "@/components/ui";

type Filtro = "todos" | "abaixo" | "vencendo";

function formatarData(data: string | null) {
  if (!data) return "sem validade";
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    month: "2-digit",
    year: "numeric",
  });
}

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f } = await searchParams;
  const filtro = (f ?? "todos") as Filtro;
  const supabase = await createClient();

  const [{ data: produtos }, { data: movimentacoes }] = await Promise.all([
    supabase
      .from("produtos")
      .select("id, nome_completo, estoque_minimo, controla_lote_validade, estoque_lotes(quantidade, validade)")
      .eq("ativo", true)
      .order("nome_completo"),
    supabase
      .from("estoque_movimentacoes")
      .select("id, tipo, quantidade, motivo, created_at, produtos(nome_completo), usuarios(nome), atendimentos(clientes(nome))")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const hoje = new Date();
  const em60Dias = new Date();
  em60Dias.setDate(em60Dias.getDate() + 60);
  const inicioMes = new Date();
  inicioMes.setDate(1);

  const itens = (produtos ?? []).map((p) => {
    const lotesComSaldo = (p.estoque_lotes ?? []).filter((l) => l.quantidade > 0);
    const emEstoque = lotesComSaldo.reduce((soma, l) => soma + l.quantidade, 0);
    const validadeProxima = lotesComSaldo
      .map((l) => l.validade)
      .filter((v): v is string => Boolean(v))
      .sort()[0];

    let situacao: "ok" | "abaixo" | "vencendo" = "ok";
    if (emEstoque < p.estoque_minimo) situacao = "abaixo";
    else if (validadeProxima && new Date(validadeProxima + "T00:00:00") <= em60Dias) {
      situacao = "vencendo";
    }

    const diasParaVencer = validadeProxima
      ? Math.ceil(
          (new Date(validadeProxima + "T00:00:00").getTime() - hoje.getTime()) /
            (24 * 60 * 60 * 1000),
        )
      : null;

    return {
      id: p.id,
      nome: p.nome_completo ?? "Produto",
      emEstoque,
      minimo: p.estoque_minimo,
      validadeProxima,
      diasParaVencer,
      situacao,
    };
  });

  const abaixoDoMinimo = itens.filter((i) => i.situacao === "abaixo");
  const vencendo = itens.filter((i) => i.situacao === "vencendo");
  const saidasMes = (movimentacoes ?? []).filter(
    (m) => m.tipo === "saida" && m.created_at >= inicioMes.toISOString(),
  );

  const visiveis =
    filtro === "abaixo" ? abaixoDoMinimo : filtro === "vencendo" ? vencendo : itens;

  const FILTROS: { id: Filtro; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "abaixo", label: "Abaixo do mínimo" },
    { id: "vencendo", label: "Vencendo" },
  ];

  return (
    <>
      <PageHeader
        titulo="Estoque"
        descricao="A saída é automática no fechamento de cada atendimento. Aqui entram as compras e os ajustes."
        acoes={
          <Link href="/estoque/entrada">
            <Button>Registrar entrada</Button>
          </Link>
        }
      />

      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        <Card className="flex flex-col gap-1">
          <span className="text-[13px] text-texto-secundario">Abaixo do mínimo</span>
          <span className="font-titulo text-[30px] text-bordo">{abaixoDoMinimo.length}</span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-[13px] text-texto-secundario">Vencem em 60 dias</span>
          <span className="font-titulo text-[30px] text-situacao-atencao-fg">{vencendo.length}</span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-[13px] text-texto-secundario">Produtos controlados</span>
          <span className="font-titulo text-[30px]">{itens.length}</span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-[13px] text-texto-secundario">Saídas este mês</span>
          <span className="font-titulo text-[30px]">
            {saidasMes.reduce((s, m) => s + m.quantidade, 0)}
          </span>
        </Card>
      </section>

      <div role="group" aria-label="Filtros" className="flex flex-wrap gap-2">
        {FILTROS.map((opt) => (
          <Link
            key={opt.id}
            href={opt.id === "todos" ? "/estoque" : `/estoque?f=${opt.id}`}
            className={`flex h-11 items-center rounded-full border px-4 text-sm font-semibold ${
              filtro === opt.id ? "border-texto bg-texto text-white" : "border-[#cfc8bf] bg-superficie text-texto"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <Table className="flex-[999_1_520px]">
          <TableHead>
            <tr>
              <Th>Produto</Th>
              <Th className="text-right">Em estoque</Th>
              <Th className="text-right">Mínimo</Th>
              <Th>Validade mais próxima</Th>
              <Th>Situação</Th>
              <Th>Ação</Th>
            </tr>
          </TableHead>
          <tbody>
            {visiveis.map((i) => (
              <TableRow key={i.id}>
                <Td className="font-semibold">{i.nome}</Td>
                <Td className="text-right font-semibold">{i.emEstoque}</Td>
                <Td className="text-right">{i.minimo}</Td>
                <Td className="whitespace-nowrap">{formatarData(i.validadeProxima ?? null)}</Td>
                <Td>
                  <StatusTag
                    situacao={
                      i.situacao === "abaixo" ? "atraso" : i.situacao === "vencendo" ? "atencao" : "em-dia"
                    }
                  >
                    {i.situacao === "abaixo"
                      ? "Abaixo do mínimo"
                      : i.situacao === "vencendo"
                        ? `Vence em ${i.diasParaVencer} dias`
                        : "Em dia"}
                  </StatusTag>
                </Td>
                <Td>
                  <Link href={`/estoque/entrada?produtoId=${i.id}`}>
                    <Button variante="secundario">Dar entrada</Button>
                  </Link>
                </Td>
              </TableRow>
            ))}
            {visiveis.length === 0 && (
              <TableRow>
                <Td colSpan={6} className="text-center text-texto-secundario">
                  Nenhum produto nesta aba.
                </Td>
              </TableRow>
            )}
          </tbody>
        </Table>

        <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-2.5 rounded-xl border border-borda bg-superficie p-5.5">
          <h2 className="font-titulo text-[22px] font-normal">Últimas movimentações</h2>
          {(movimentacoes ?? []).map((m) => (
            <div key={m.id} className="flex items-start gap-3 border-t border-[#eee8e0] pt-2.5">
              <div
                className={`w-11 flex-none text-[15px] font-bold ${
                  m.tipo === "saida" ? "text-bordo" : "text-situacao-em-dia-fg"
                }`}
              >
                {m.tipo === "saida" ? "−" : "+"}
                {Math.abs(m.quantidade)}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="text-sm font-semibold">{m.produtos?.nome_completo}</div>
                <div className="text-[13px] text-texto-secundario">
                  {m.atendimentos
                    ? `Atendimento · ${m.atendimentos.clientes?.nome ?? ""} · ${m.usuarios?.nome ?? ""}`
                    : m.motivo || (m.tipo === "entrada" ? "Compra" : "Ajuste")}
                </div>
              </div>
              <div className="flex-none text-[13px] text-texto-secundario">
                {new Date(m.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              </div>
            </div>
          ))}
          {(movimentacoes ?? []).length === 0 && (
            <p className="text-sm text-texto-secundario">Nenhuma movimentação ainda.</p>
          )}
        </aside>
      </div>
    </>
  );
}
