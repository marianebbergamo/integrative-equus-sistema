import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { CamposEndereco } from "@/components/forms/CamposEndereco";
import { criarLocal } from "../actions";

export default async function NovoLocalPage() {
  const supabase = await createClient();
  const { data: regioes } = await supabase
    .from("regioes")
    .select("id, nome")
    .order("ordem");

  return (
    <>
      <PageHeader titulo="Novo local" />
      <Card className="max-w-2xl">
        <form action={criarLocal} className="flex flex-col gap-4">
          <TextField name="nome" label="Nome do local" required />
          <div className="grid grid-cols-2 gap-3">
            <Select name="tipo" label="Tipo" defaultValue="haras">
              <option value="haras">Haras</option>
              <option value="ct">Centro de treinamento</option>
              <option value="fazenda">Fazenda</option>
              <option value="propriedade_cliente">Propriedade do cliente</option>
            </Select>
            <Select name="regiao_id" label="Região de rota">
              <option value="">Selecione</option>
              {(regioes ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </Select>
          </div>

          <h2 className="mt-2 border-t border-borda pt-4 text-base font-bold">
            Endereço
          </h2>
          <CamposEndereco />

          <h2 className="mt-2 border-t border-borda pt-4 text-base font-bold">
            Responsável no local
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <TextField name="responsavel_nome" label="Nome" />
            <TextField name="responsavel_telefone" label="Telefone" />
          </div>
          <TextField
            name="como_chegar"
            label="Como chegar e observações"
            hint="Ponto de referência, porteira, horários"
          />

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar local</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
