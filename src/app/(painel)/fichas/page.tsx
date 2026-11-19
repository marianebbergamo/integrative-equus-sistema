import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, PageHeader, Table, TableHead, TableRow, Th, Td } from "@/components/ui";

export default async function FichasPage() {
  const supabase = await createClient();

  const { data: atendimentos, error } = await supabase
    .from("atendimentos")
    .select("id, data_agendamento, clientes(nome), locais(cidade), usuarios(nome)")
    .eq("etapa", "registrar_atendimento")
    .order("data_agendamento");

  if (error) {
    throw new Error("Não foi possível carregar os atendimentos: " + error.message);
  }

  return (
    <>
      <PageHeader
        titulo="Fichas e fechamento"
        descricao="Atendimentos feitos, aguardando a ficha e o fechamento."
      />

      <Table>
        <TableHead>
          <tr>
            <Th>Cliente</Th>
            <Th>Cidade</Th>
            <Th>Veterinário</Th>
            <Th>Atendido em</Th>
            <Th />
          </tr>
        </TableHead>
        <tbody>
          {(atendimentos ?? []).map((a) => (
            <TableRow key={a.id}>
              <Td className="font-semibold">{a.clientes?.nome}</Td>
              <Td>{a.locais?.cidade ?? "—"}</Td>
              <Td>{a.usuarios?.nome ?? "—"}</Td>
              <Td className="whitespace-nowrap">
                {a.data_agendamento
                  ? new Date(a.data_agendamento).toLocaleDateString("pt-BR")
                  : "—"}
              </Td>
              <Td>
                <Link href={`/fichas/${a.id}`}>
                  <Button variante="secundario">Preencher ficha e fechar</Button>
                </Link>
              </Td>
            </TableRow>
          ))}
          {(atendimentos ?? []).length === 0 && (
            <TableRow>
              <Td colSpan={5} className="text-center text-texto-secundario">
                Nenhum atendimento aguardando ficha.
              </Td>
            </TableRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
