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

const RotuloTipo: Record<string, string> = {
  haras: "Haras",
  ct: "Centro de treinamento",
  fazenda: "Fazenda",
  propriedade_cliente: "Propriedade do cliente",
};

export default async function HarasPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const supabase = await createClient();

  const { data: locais, error } = await supabase
    .from("locais")
    .select("id, nome, tipo, cidade, regioes(nome), animais(count)")
    .order("nome");

  if (error) {
    throw new Error("Não foi possível carregar os locais: " + error.message);
  }

  const selecionadoId = id ?? locais?.[0]?.id;

  const { data: local } = selecionadoId
    ? await supabase
        .from("locais")
        .select("*, regioes(nome)")
        .eq("id", selecionadoId)
        .single()
    : { data: null };

  const { data: animaisDoLocal } = selecionadoId
    ? await supabase
        .from("animais")
        .select("id, nome, clientes(nome)")
        .eq("local_id", selecionadoId)
        .order("nome")
    : { data: [] };

  const proprietarios = new Set(
    (animaisDoLocal ?? []).map((a) => a.clientes?.nome).filter(Boolean),
  );

  return (
    <>
      <PageHeader
        titulo="Haras e locais"
        descricao="Onde os animais ficam. É este endereço que entra na rota."
        acoes={
          <Link href="/haras/novo">
            <Button>Novo local</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-start gap-5">
        <Table className="min-w-[600px] flex-[999_1_520px]">
          <TableHead>
            <tr>
              <Th>Local</Th>
              <Th>Tipo</Th>
              <Th>Cidade</Th>
              <Th>Região de rota</Th>
              <Th>Animais</Th>
            </tr>
          </TableHead>
          <tbody>
            {(locais ?? []).map((l) => (
              <TableRow
                key={l.id}
                className={l.id === selecionadoId ? "bg-fundo" : undefined}
              >
                <Td>
                  <Link href={`/haras?id=${l.id}`} className="font-semibold">
                    {l.nome}
                  </Link>
                </Td>
                <Td>{RotuloTipo[l.tipo]}</Td>
                <Td className="whitespace-nowrap">{l.cidade ?? "—"}</Td>
                <Td>
                  {l.regioes?.nome && (
                    <StatusTag situacao="informacao">{l.regioes.nome}</StatusTag>
                  )}
                </Td>
                <Td>{l.animais?.[0]?.count ?? 0}</Td>
              </TableRow>
            ))}
            {(locais ?? []).length === 0 && (
              <TableRow>
                <Td colSpan={5} className="text-center text-texto-secundario">
                  Nenhum local cadastrado ainda.
                </Td>
              </TableRow>
            )}
          </tbody>
        </Table>

        {local && (
          <Card className="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <h2 className="font-titulo text-[22px] font-normal">{local.nome}</h2>
              <div className="text-sm text-texto-secundario">
                {RotuloTipo[local.tipo]}
                {local.regioes?.nome && ` · ${local.regioes.nome}`}
              </div>
            </div>
            <dl className="flex flex-col gap-2.5 text-[15px]">
              <div>
                <dt className="text-[13px] text-texto-secundario">Endereço</dt>
                <dd>
                  {[local.logradouro, local.numero && `nº ${local.numero}`]
                    .filter(Boolean)
                    .join(", ") || "—"}
                  <br />
                  {[local.bairro, local.cidade, local.uf, local.cep]
                    .filter(Boolean)
                    .join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">
                  Responsável no local
                </dt>
                <dd>
                  {[local.responsavel_nome, local.responsavel_telefone]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">
                  Como chegar e observações
                </dt>
                <dd>{local.como_chegar ?? "—"}</dd>
              </div>
            </dl>
            <Link href={`/haras/${local.id}/editar`}>
              <Button variante="secundario">Editar</Button>
            </Link>

            <div className="flex flex-col gap-2 border-t border-borda pt-3.5">
              <h3 className="text-[15px] font-bold">
                {animaisDoLocal?.length ?? 0} animais de {proprietarios.size}{" "}
                proprietários
              </h3>
              {(animaisDoLocal ?? []).map((a) => (
                <Link
                  key={a.id}
                  href={`/animais/${a.id}`}
                  className="flex justify-between gap-3 border-t border-[#eee8e0] pt-2 text-sm first:border-t-0 first:pt-0"
                >
                  <span className="font-semibold">{a.nome}</span>
                  <span className="text-texto-secundario">
                    {a.clientes?.nome ?? "—"}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
