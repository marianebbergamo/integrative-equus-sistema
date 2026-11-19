import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Button,
  PageHeader,
  Table,
  TableHead,
  TableRow,
  Th,
  Td,
} from "@/components/ui";

export default async function AnimaisPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  let consulta = supabase
    .from("animais")
    .select("id, nome, raca, sexo, clientes(nome), locais(nome, cidade)")
    .order("nome");

  if (q) {
    consulta = consulta.ilike("nome", `%${q}%`);
  }

  const { data: animais, error } = await consulta;

  if (error) {
    throw new Error("Não foi possível carregar os animais: " + error.message);
  }

  return (
    <>
      <PageHeader
        titulo="Animais"
        descricao={`${animais?.length ?? 0} animais cadastrados`}
        acoes={
          <Link href="/animais/novo">
            <Button>Novo animal</Button>
          </Link>
        }
      />

      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome do animal"
          className="box-border h-11 w-70 max-w-full rounded-lg border border-[#cfc8bf] bg-superficie px-3.5 text-[15px] text-texto"
        />
        <Button type="submit" variante="secundario">
          Buscar
        </Button>
      </form>

      <Table>
        <TableHead>
          <tr>
            <Th>Animal</Th>
            <Th>Raça</Th>
            <Th>Sexo</Th>
            <Th>Proprietário</Th>
            <Th>Onde fica</Th>
          </tr>
        </TableHead>
        <tbody>
          {(animais ?? []).map((a) => (
            <TableRow key={a.id}>
              <Td>
                <Link href={`/animais/${a.id}`} className="font-semibold">
                  {a.nome}
                </Link>
              </Td>
              <Td>{a.raca ?? "—"}</Td>
              <Td>{a.sexo === "femea" ? "Égua" : a.sexo === "macho" ? "Macho" : "—"}</Td>
              <Td>{a.clientes?.nome ?? "—"}</Td>
              <Td>
                {a.locais ? `${a.locais.nome} · ${a.locais.cidade ?? ""}` : "endereço do proprietário"}
              </Td>
            </TableRow>
          ))}
          {(animais ?? []).length === 0 && (
            <TableRow>
              <Td colSpan={5} className="text-center text-texto-secundario">
                Nenhum animal encontrado.
              </Td>
            </TableRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
