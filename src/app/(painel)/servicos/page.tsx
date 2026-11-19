import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Button,
  Card,
  PageHeader,
  Table,
  TableHead,
  TableRow,
  Th,
  Td,
} from "@/components/ui";
import { UNIDADES_COBRANCA_SERVICO } from "@/lib/catalogoOpcoes";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const supabase = await createClient();

  const { data: servicos, error } = await supabase
    .from("servicos")
    .select("id, nome, categoria, unidade_cobranca, valor, duracao_media_minutos, retorno_dias, tipo_ficha")
    .order("nome");

  if (error) {
    throw new Error("Não foi possível carregar os serviços: " + error.message);
  }

  const selecionadoId = id ?? servicos?.[0]?.id;

  const { data: servico } = selecionadoId
    ? await supabase
        .from("servicos")
        .select("*, usuarios(nome)")
        .eq("id", selecionadoId)
        .single()
    : { data: null };

  const { data: regioes } = await supabase
    .from("regioes")
    .select("id, nome, valor_deslocamento_km")
    .order("ordem");

  return (
    <>
      <PageHeader
        titulo="Serviços e valores"
        descricao="O catálogo que alimenta proposta, agenda, ficha e cobrança."
        acoes={
          <Link href="/servicos/novo">
            <Button>Novo serviço</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
          <Table>
            <TableHead>
              <tr>
                <Th>Serviço</Th>
                <Th>Cobrança</Th>
                <Th className="text-right">Valor</Th>
                <Th>Duração</Th>
                <Th>Retorno</Th>
                <Th>Ficha</Th>
              </tr>
            </TableHead>
            <tbody>
              {(servicos ?? []).map((s) => (
                <TableRow
                  key={s.id}
                  className={s.id === selecionadoId ? "bg-fundo" : undefined}
                >
                  <Td>
                    <Link href={`/servicos?id=${s.id}`} className="font-semibold">
                      {s.nome}
                    </Link>
                    <br />
                    <span className="text-[13px] text-texto-secundario">
                      {s.categoria ?? "sem categoria"}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {UNIDADES_COBRANCA_SERVICO[s.unidade_cobranca]}
                  </Td>
                  <Td className="text-right font-semibold whitespace-nowrap">
                    {formatarMoeda(s.valor)}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {s.duracao_media_minutos ? `${s.duracao_media_minutos} min` : "—"}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {s.retorno_dias ? `${s.retorno_dias} dias` : "sem retorno"}
                  </Td>
                  <Td>{s.tipo_ficha ?? "—"}</Td>
                </TableRow>
              ))}
              {(servicos ?? []).length === 0 && (
                <TableRow>
                  <Td colSpan={6} className="text-center text-texto-secundario">
                    Nenhum serviço cadastrado ainda.
                  </Td>
                </TableRow>
              )}
            </tbody>
          </Table>

          <Card className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-base font-bold">Deslocamento por região</h2>
              <Link href="/servicos/regioes" className="text-sm font-semibold">
                Editar tabela
              </Link>
            </div>
            <p className="text-sm text-texto-secundario">
              Entra sozinho na proposta conforme a região do local do animal.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
              {(regioes ?? []).map((r) => (
                <div key={r.id} className="flex flex-col gap-0.5 rounded-lg bg-fundo px-3 py-2.5">
                  <span className="text-[13px] text-texto-secundario">{r.nome}</span>
                  <span className="text-[15px] font-semibold">
                    {formatarMoeda(r.valor_deslocamento_km)}/km
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {servico && (
          <Card className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
            <h2 className="font-titulo text-[22px] font-normal">{servico.nome}</h2>
            <dl className="flex flex-col gap-2.5 text-[15px]">
              <div>
                <dt className="text-[13px] text-texto-secundario">Categoria</dt>
                <dd>{servico.categoria ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">Cobrança</dt>
                <dd>
                  {UNIDADES_COBRANCA_SERVICO[servico.unidade_cobranca]} ·{" "}
                  {formatarMoeda(servico.valor)}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">Duração média</dt>
                <dd>
                  {servico.duracao_media_minutos
                    ? `${servico.duracao_media_minutos} min`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">Retorno sugerido</dt>
                <dd>{servico.retorno_dias ? `${servico.retorno_dias} dias` : "sem retorno"}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">Ficha de atendimento</dt>
                <dd>{servico.tipo_ficha ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">Quem realiza</dt>
                <dd>{servico.usuarios?.nome ?? "Fabi ou Bruno"}</dd>
              </div>
            </dl>
            <Link href={`/servicos/${servico.id}/editar`}>
              <Button variante="secundario">Editar</Button>
            </Link>
          </Card>
        )}
      </div>
    </>
  );
}
