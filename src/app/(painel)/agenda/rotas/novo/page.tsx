import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { NovaRotaForm } from "./NovaRotaForm";

export default async function NovaRotaPage({
  searchParams,
}: {
  searchParams: Promise<{ regiaoId?: string }>;
}) {
  const { regiaoId } = await searchParams;
  const supabase = await createClient();

  const { data: atendimentos, error } = await supabase
    .from("atendimentos")
    .select(
      "id, clientes(nome), locais(cidade, regiao_id), atendimento_itens(servicos(nome))",
    )
    .eq("etapa", "a_agendar")
    .order("data_aprovacao");

  if (error) {
    throw new Error("Não foi possível carregar a lista de espera: " + error.message);
  }

  const lista = (atendimentos ?? [])
    .filter((a) => (regiaoId ? a.locais?.regiao_id === regiaoId : true))
    .map((a) => ({
      id: a.id,
      cliente: a.clientes?.nome ?? "—",
      cidade: a.locais?.cidade ?? "—",
      servicos:
        Array.from(
          new Set(
            a.atendimento_itens?.map((i) => i.servicos?.nome).filter((n): n is string => Boolean(n)),
          ),
        ).join(", ") || "sem itens",
    }));

  return (
    <>
      <PageHeader titulo="Nova rota" descricao="Escolha a data e os atendimentos que entram nela." />
      <Card className="max-w-2xl">
        <NovaRotaForm regiaoId={regiaoId ?? null} atendimentos={lista} />
      </Card>
    </>
  );
}
