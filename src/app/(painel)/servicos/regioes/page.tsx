import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, TextField } from "@/components/ui";
import { atualizarRegioes } from "../actions";

export default async function RegioesPage() {
  const supabase = await createClient();
  const { data: regioes } = await supabase
    .from("regioes")
    .select("id, nome, valor_deslocamento_km")
    .order("ordem");

  const ids = (regioes ?? []).map((r) => r.id);
  const salvar = atualizarRegioes.bind(null, ids);

  return (
    <>
      <PageHeader
        titulo="Deslocamento por região"
        descricao="O valor por quilômetro cobrado em cada região de rota."
      />
      <Card className="max-w-xl">
        <form action={salvar} className="flex flex-col gap-4">
          {(regioes ?? []).map((r) => (
            <TextField
              key={r.id}
              name={`valor_${r.id}`}
              label={`${r.nome} (R$/km)`}
              type="number"
              step="0.01"
              min="0"
              defaultValue={r.valor_deslocamento_km}
            />
          ))}
          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar tabela</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
