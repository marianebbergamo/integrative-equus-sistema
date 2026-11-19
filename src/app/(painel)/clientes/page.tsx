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
import { GerarLinkCadastro } from "./GerarLinkCadastro";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cadastro?: string }>;
}) {
  const { q = "", cadastro } = await searchParams;
  const supabase = await createClient();

  let consulta = supabase
    .from("clientes")
    .select("id, nome, telefone, cidade, indicado_por, animais(count)")
    .order("nome");

  if (q) {
    consulta = consulta.or(
      `nome.ilike.%${q}%,documento.ilike.%${q}%,telefone.ilike.%${q}%`,
    );
  }

  const { data: clientes, error } = await consulta;

  if (error) {
    throw new Error("Não foi possível carregar os clientes: " + error.message);
  }

  const { data: status } = await supabase
    .from("clientes_cadastro_status")
    .select("cliente_id, cadastro_completo");

  const completoPorCliente = new Map(
    (status ?? []).map((s) => [s.cliente_id, s.cadastro_completo ?? false]),
  );

  const comStatus = (clientes ?? []).map((c) => ({
    ...c,
    completo: completoPorCliente.get(c.id) ?? false,
  }));

  const visiveis =
    cadastro === "incompleto"
      ? comStatus.filter((c) => !c.completo)
      : comStatus;

  const incompletos = comStatus.filter((c) => !c.completo).length;

  return (
    <>
      <PageHeader
        titulo="Clientes"
        descricao={`${comStatus.length} clientes · ${incompletos} com cadastro incompleto`}
        acoes={
          <>
            <Link href="/clientes/novo">
              <Button variante="secundario">Novo cliente</Button>
            </Link>
            <GerarLinkCadastro />
          </>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold">Buscar</h2>
          <p className="text-sm text-texto-secundario">
            Por nome, CPF/CNPJ ou telefone.
          </p>
        </div>
        <form className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome, CPF ou telefone"
            className="box-border h-11 w-70 max-w-full rounded-lg border border-[#cfc8bf] bg-superficie px-3.5 text-[15px] text-texto"
          />
          <Button type="submit" variante="secundario">
            Buscar
          </Button>
        </form>
      </Card>

      <div role="group" aria-label="Filtros" className="flex flex-wrap gap-2">
        <Link
          href="/clientes"
          className={`flex h-11 items-center rounded-full border px-4 text-sm font-semibold ${
            !cadastro
              ? "border-texto bg-texto text-white"
              : "border-[#cfc8bf] bg-superficie text-texto"
          }`}
        >
          Todos
        </Link>
        <Link
          href="/clientes?cadastro=incompleto"
          className={`flex h-11 items-center rounded-full border px-4 text-sm font-semibold ${
            cadastro === "incompleto"
              ? "border-texto bg-texto text-white"
              : "border-[#cfc8bf] bg-superficie text-texto"
          }`}
        >
          Cadastro incompleto
        </Link>
      </div>

      <Table>
        <TableHead>
          <tr>
            <Th>Cliente</Th>
            <Th>Cidade</Th>
            <Th>Animais</Th>
            <Th>Indicado por</Th>
            <Th>Cadastro</Th>
            <Th>Ação</Th>
          </tr>
        </TableHead>
        <tbody>
          {visiveis.map((c) => (
            <TableRow key={c.id}>
              <Td>
                <Link href={`/clientes/${c.id}`} className="font-semibold">
                  {c.nome}
                </Link>
                <br />
                <span className="text-[13px] text-texto-secundario">
                  {c.telefone ?? "sem telefone"}
                </span>
              </Td>
              <Td className="whitespace-nowrap">{c.cidade ?? "—"}</Td>
              <Td>{c.animais?.[0]?.count ?? 0}</Td>
              <Td>{c.indicado_por ?? "—"}</Td>
              <Td>
                <StatusTag situacao={c.completo ? "em-dia" : "atencao"}>
                  {c.completo ? "Completo" : "Incompleto"}
                </StatusTag>
              </Td>
              <Td>
                {!c.completo && <GerarLinkCadastro clienteId={c.id} rotulo="Reenviar link" />}
              </Td>
            </TableRow>
          ))}
          {visiveis.length === 0 && (
            <TableRow>
              <Td colSpan={6} className="text-center text-texto-secundario">
                Nenhum cliente encontrado.
              </Td>
            </TableRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
