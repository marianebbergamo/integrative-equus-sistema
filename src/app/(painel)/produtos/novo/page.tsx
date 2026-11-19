import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { CLASSES_PRODUTO, UNIDADES_USO_PRODUTO } from "@/lib/catalogoOpcoes";
import { criarProduto } from "../actions";

export default function NovoProdutoPage() {
  return (
    <>
      <PageHeader titulo="Novo produto" />
      <Card className="max-w-2xl">
        <div className="mb-2 rounded-lg bg-situacao-informacao-bg px-3 py-2 text-sm text-situacao-informacao-fg">
          O nome é montado sozinho: classe, nome comercial e concentração. Assim
          não nascem duplicados.
        </div>
        <form action={criarProduto} className="flex flex-col gap-4">
          <Select name="classe" label="Classe" defaultValue={CLASSES_PRODUTO[0]} required>
            {CLASSES_PRODUTO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <TextField name="nome_comercial" label="Nome comercial" required />
            <TextField name="concentracao" label="Concentração" />
          </div>
          <TextField name="fabricante" label="Fabricante" />
          <div className="grid grid-cols-2 gap-3">
            <Select name="unidade_uso" label="Unidade de uso" defaultValue="frasco">
              {Object.entries(UNIDADES_USO_PRODUTO).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </Select>
            <TextField name="estoque_minimo" label="Estoque mínimo" type="number" min="0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField name="custo" label="Custo (R$)" type="number" step="0.01" min="0" />
            <TextField
              name="preco_venda"
              label="Preço de venda (R$)"
              type="number"
              step="0.01"
              min="0"
            />
          </div>
          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              name="cobrar_cliente_padrao"
              defaultChecked
              className="h-5 w-5 accent-bordo"
            />
            Cobrar do cliente por padrão
          </label>
          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              name="controla_lote_validade"
              defaultChecked
              className="h-5 w-5 accent-bordo"
            />
            Controlar lote e validade
          </label>
          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input type="checkbox" name="ativo" defaultChecked className="h-5 w-5 accent-bordo" />
            Ativo no catálogo
          </label>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar produto</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
