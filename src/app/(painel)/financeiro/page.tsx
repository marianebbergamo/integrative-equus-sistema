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
import { confirmarRecebimento } from "./actions";

const FORMAS_PAGAMENTO: Record<string, string> = {
  pix: "Pix",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
  boleto: "Boleto",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string | null) {
  if (!data) return "—";
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

type Aba = "todas" | "cobrar" | "aguardando" | "atraso" | "nf";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba: abaParam } = await searchParams;
  const aba = (abaParam ?? "todas") as Aba;
  const supabase = await createClient();

  const { data: cobrancas, error } = await supabase
    .from("cobrancas")
    .select(
      "id, valor, forma_pagamento, vencimento, situacao, data_pagamento, atendimentos(id, numero, etapa, clientes(nome, telefone), locais(cidade), atendimento_itens(animais(nome), servicos(nome)))",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar as cobranças: " + error.message);
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const inicioMes = new Date();
  inicioMes.setDate(1);
  const inicioMesIso = inicioMes.toISOString().slice(0, 10);

  type Tipo = "cobrar" | "aguardando" | "atraso" | "nf" | "concluido";
  const todasClassificadas = (cobrancas ?? [])
    .filter((c) => c.atendimentos)
    .map((c) => {
      let tipo: Tipo = "concluido";
      if (c.atendimentos!.etapa === "a_cobrar") tipo = "cobrar";
      else if (c.atendimentos!.etapa === "aguardando_pagamento") {
        tipo = c.vencimento && c.vencimento < hoje ? "atraso" : "aguardando";
      } else if (c.atendimentos!.etapa === "emitir_nota_fiscal") tipo = "nf";

      const animais = Array.from(
        new Set(
          c.atendimentos!.atendimento_itens
            ?.map((i) => i.animais?.nome)
            .filter((n): n is string => Boolean(n)),
        ),
      ).join(", ");
      const servicos = Array.from(
        new Set(
          c.atendimentos!.atendimento_itens
            ?.map((i) => i.servicos?.nome)
            .filter((n): n is string => Boolean(n)),
        ),
      ).join(", ");

      return { ...c, tipo, descricao: [animais, servicos, c.atendimentos!.locais?.cidade].filter(Boolean).join(" · ") };
    });

  const classificadas = todasClassificadas.filter((c) => c.tipo !== "concluido");

  const recebidoMes = todasClassificadas
    .filter((c) => c.situacao === "paga" && c.data_pagamento && c.data_pagamento >= inicioMesIso)
    .reduce((soma, c) => soma + c.valor, 0);
  const aReceber = classificadas
    .filter((c) => c.tipo === "cobrar" || c.tipo === "aguardando" || c.tipo === "atraso")
    .reduce((soma, c) => soma + c.valor, 0);
  const emAtraso = classificadas.filter((c) => c.tipo === "atraso");
  const clientesEmAtraso = new Set(emAtraso.map((c) => c.atendimentos!.clientes?.nome)).size;
  const notasAEmitir = classificadas.filter((c) => c.tipo === "nf").length;

  const abas: { id: Aba; label: string; n: number }[] = [
    { id: "todas", label: "Tudo em aberto", n: classificadas.length },
    { id: "cobrar", label: "A cobrar", n: classificadas.filter((c) => c.tipo === "cobrar").length },
    {
      id: "aguardando",
      label: "Aguardando pagamento",
      n: classificadas.filter((c) => c.tipo === "aguardando").length,
    },
    { id: "atraso", label: "Em atraso", n: emAtraso.length },
    { id: "nf", label: "Emitir NF", n: notasAEmitir },
  ];

  const visiveis = aba === "todas" ? classificadas : classificadas.filter((c) => c.tipo === aba);

  const ROTULOS: Record<Tipo, { situacao: string; acao: string; tag: "em-dia" | "atencao" | "atraso" | "informacao" }> = {
    cobrar: { situacao: "A cobrar", acao: "Enviar cobrança", tag: "informacao" },
    aguardando: { situacao: "Aguardando pagamento", acao: "Confirmar recebimento", tag: "informacao" },
    atraso: { situacao: "Em atraso", acao: "Cobrar no WhatsApp", tag: "atraso" },
    nf: { situacao: "Pago · falta a NF", acao: "Emitir nota fiscal", tag: "atencao" },
    concluido: { situacao: "Concluído", acao: "", tag: "em-dia" },
  };

  return (
    <>
      <PageHeader
        titulo="Cobranças"
        descricao="Do fechamento do veterinário até a nota fiscal emitida."
      />

      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        <Card className="flex flex-col gap-1">
          <span className="text-[13px] text-texto-secundario">Recebido este mês</span>
          <span className="font-titulo text-[30px] text-situacao-em-dia-fg">
            {formatarMoeda(recebidoMes)}
          </span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-[13px] text-texto-secundario">A receber</span>
          <span className="font-titulo text-[30px]">{formatarMoeda(aReceber)}</span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-[13px] text-texto-secundario">
            Em atraso · {clientesEmAtraso} cliente{clientesEmAtraso === 1 ? "" : "s"}
          </span>
          <span className="font-titulo text-[30px] text-bordo">
            {formatarMoeda(emAtraso.reduce((s, c) => s + c.valor, 0))}
          </span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-[13px] text-texto-secundario">Notas fiscais a emitir</span>
          <span className="font-titulo text-[30px]">{notasAEmitir}</span>
        </Card>
      </section>

      <div role="group" aria-label="Filtrar por etapa" className="flex flex-wrap gap-2">
        {abas.map((a) => (
          <Link
            key={a.id}
            href={a.id === "todas" ? "/financeiro" : `/financeiro?aba=${a.id}`}
            className={`flex h-11 items-center rounded-full border px-4 text-sm font-semibold ${
              aba === a.id ? "border-texto bg-texto text-white" : "border-[#cfc8bf] bg-superficie text-texto"
            }`}
          >
            {a.label} · {a.n}
          </Link>
        ))}
      </div>

      <Table>
        <TableHead>
          <tr>
            <Th>Cliente e atendimento</Th>
            <Th className="text-right">Valor</Th>
            <Th>Forma</Th>
            <Th>Vencimento</Th>
            <Th>Situação</Th>
            <Th>Próximo passo</Th>
          </tr>
        </TableHead>
        <tbody>
          {visiveis.map((c) => {
            const rotulo = ROTULOS[c.tipo];
            const whatsapp = c.atendimentos!.clientes?.telefone?.replace(/\D/g, "");
            return (
              <TableRow key={c.id}>
                <Td>
                  <span className="font-semibold">{c.atendimentos!.clientes?.nome}</span>
                  <br />
                  <span className="text-[13px] text-texto-secundario">{c.descricao}</span>
                </Td>
                <Td className="text-right font-semibold whitespace-nowrap">
                  {formatarMoeda(c.valor)}
                </Td>
                <Td className="whitespace-nowrap">
                  {c.forma_pagamento ? FORMAS_PAGAMENTO[c.forma_pagamento] : "a combinar"}
                </Td>
                <Td className="whitespace-nowrap">
                  {c.tipo === "nf" ? `pago em ${formatarData(c.data_pagamento)}` : formatarData(c.vencimento)}
                </Td>
                <Td>
                  <StatusTag situacao={rotulo.tag}>{rotulo.situacao}</StatusTag>
                </Td>
                <Td>
                  {c.tipo === "cobrar" && (
                    <Link href={`/financeiro/${c.id}/cobranca`}>
                      <Button variante="secundario">Enviar cobrança</Button>
                    </Link>
                  )}
                  {c.tipo === "aguardando" && (
                    <form action={confirmarRecebimento.bind(null, c.id, c.atendimentos!.id)}>
                      <Button type="submit" variante="secundario">
                        Confirmar recebimento
                      </Button>
                    </form>
                  )}
                  {c.tipo === "atraso" && whatsapp && (
                    <a
                      href={`https://wa.me/55${whatsapp}?text=${encodeURIComponent(
                        `Olá! Passando para lembrar da cobrança em aberto de ${formatarMoeda(c.valor)} com a Integrative Equus.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variante="secundario">Cobrar no WhatsApp</Button>
                    </a>
                  )}
                  {c.tipo === "nf" && (
                    <Link href={`/financeiro/${c.id}/nota-fiscal`}>
                      <Button variante="secundario">Emitir nota fiscal</Button>
                    </Link>
                  )}
                </Td>
              </TableRow>
            );
          })}
          {visiveis.length === 0 && (
            <TableRow>
              <Td colSpan={6} className="text-center text-texto-secundario">
                Nenhuma cobrança nesta aba.
              </Td>
            </TableRow>
          )}
        </tbody>
      </Table>

      <p className="text-[13px] text-texto-secundario">
        Ao abrir uma cobrança, o financeiro vê os dados do cliente, o animal, o que estava na
        proposta e o que foi acrescentado no atendimento.
      </p>
    </>
  );
}
