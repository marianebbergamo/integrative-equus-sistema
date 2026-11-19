import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { CLASSES_PRODUTO, UNIDADES_USO_PRODUTO } from "@/lib/catalogoOpcoes";
import { atualizarProduto } from "../../actions";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: produto } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", id)
    .single();

  if (!produto) notFound();

  const atualizarComId = atualizarProduto.bind(null, id);

  return (
    <>
      <PageHeader titulo={`Editar · ${produto.nome_completo}`} />
      <Card className="max-w-2xl">
        <div className="mb-2 rounded-lg bg-situacao-informacao-bg px-3 py-2 text-sm text-situacao-informacao-fg">
          O nome é montado sozinho: classe, nome comercial e concentração. Assim
          não nascem duplicados.
        </div>
        <form action={atualizarComId} className="flex flex-col gap-4">
          <Select name="classe" label="Classe" defaultValue={produto.classe} required>
            {CLASSES_PRODUTO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="nome_comercial"
              label="Nome comercial"
              defaultValue={produto.nome_comercial}
              required
            />
            <TextField
              name="concentracao"
              label="Concentração"
              defaultValue={produto.concentracao ?? ""}
            />
          </div>
          <TextField name="fabricante" label="Fabricante" defaultValue={produto.fabricante ?? ""} />
          <div className="grid grid-cols-2 gap-3">
            <Select name="unidade_uso" label="Unidade de uso" defaultValue={produto.unidade_uso}>
              {Object.entries(UNIDADES_USO_PRODUTO).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </Select>
            <TextField
              name="estoque_minimo"
              label="Estoque mínimo"
              type="number"
              min="0"
              defaultValue={produto.estoque_minimo}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="custo"
              label="Custo (R$)"
              type="number"
              step="0.01"
              min="0"
              defaultValue={produto.custo}
            />
            <TextField
              name="preco_venda"
              label="Preço de venda (R$)"
              type="number"
              step="0.01"
              min="0"
              defaultValue={produto.preco_venda}
            />
          </div>
          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              name="cobrar_cliente_padrao"
              defaultChecked={produto.cobrar_cliente_padrao}
              className="h-5 w-5 accent-bordo"
            />
            Cobrar do cliente por padrão
          </label>
          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              name="controla_lote_validade"
              defaultChecked={produto.controla_lote_validade}
              className="h-5 w-5 accent-bordo"
            />
            Controlar lote e validade
          </label>
          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              name="ativo"
              defaultChecked={produto.ativo}
              className="h-5 w-5 accent-bordo"
            />
            Ativo no catálogo
          </label>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
