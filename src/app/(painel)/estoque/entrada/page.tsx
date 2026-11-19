import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { registrarMovimentacao } from "../actions";

export default async function EntradaEstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ produtoId?: string }>;
}) {
  const { produtoId } = await searchParams;
  const supabase = await createClient();

  const { data: produtos } = await supabase
    .from("produtos")
    .select("id, nome_completo")
    .eq("ativo", true)
    .order("nome_completo");

  return (
    <>
      <PageHeader
        titulo="Registrar movimentação"
        descricao="Entradas de compra ou ajustes de inventário. A saída continua automática no fechamento."
      />
      <Card className="max-w-xl">
        <form action={registrarMovimentacao} className="flex flex-col gap-4">
          <Select name="produto_id" label="Produto" defaultValue={produtoId ?? ""} required>
            <option value="">Selecione</option>
            {(produtos ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_completo}
              </option>
            ))}
          </Select>
          <Select name="tipo" label="Tipo" defaultValue="entrada">
            <option value="entrada">Entrada (compra)</option>
            <option value="ajuste">Ajuste de inventário</option>
          </Select>
          <TextField
            name="quantidade"
            label="Quantidade"
            type="number"
            step="0.01"
            hint="No ajuste, use negativo para tirar do estoque"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField name="lote" label="Lote" />
            <TextField name="validade" label="Validade" type="date" />
          </div>
          <TextField name="motivo" label="Motivo" placeholder="Ex.: nota 1024, contagem de inventário" />

          <div className="mt-2 flex justify-end">
            <Button type="submit">Registrar</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
