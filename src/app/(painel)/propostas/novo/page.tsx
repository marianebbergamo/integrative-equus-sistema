import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { NovaPropostaForm } from "./NovaPropostaForm";

export default async function NovaPropostaPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: animais }] = await Promise.all([
    supabase.from("clientes").select("id, nome").order("nome"),
    supabase
      .from("animais")
      .select("id, nome, raca, sexo, cliente_id, locais(nome)")
      .order("nome"),
  ]);

  const animaisFormatados = (animais ?? []).map((a) => ({
    id: a.id,
    nome: a.nome,
    raca: a.raca,
    sexo: a.sexo,
    cliente_id: a.cliente_id,
    local_nome: a.locais?.nome ?? null,
  }));

  return (
    <>
      <PageHeader titulo="Novo pedido de orçamento" />
      <Card className="max-w-xl">
        <NovaPropostaForm clientes={clientes ?? []} animais={animaisFormatados} />
      </Card>
    </>
  );
}
