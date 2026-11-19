import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { CamposEndereco } from "@/components/forms/CamposEndereco";
import { atualizarLocal } from "../../actions";

export default async function EditarLocalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: local } = await supabase
    .from("locais")
    .select("*")
    .eq("id", id)
    .single();

  if (!local) notFound();

  const { data: regioes } = await supabase
    .from("regioes")
    .select("id, nome")
    .order("ordem");

  const atualizarComId = atualizarLocal.bind(null, id);

  return (
    <>
      <PageHeader titulo={`Editar · ${local.nome}`} />
      <Card className="max-w-2xl">
        <form action={atualizarComId} className="flex flex-col gap-4">
          <TextField name="nome" label="Nome do local" defaultValue={local.nome} required />
          <div className="grid grid-cols-2 gap-3">
            <Select name="tipo" label="Tipo" defaultValue={local.tipo}>
              <option value="haras">Haras</option>
              <option value="ct">Centro de treinamento</option>
              <option value="fazenda">Fazenda</option>
              <option value="propriedade_cliente">Propriedade do cliente</option>
            </Select>
            <Select
              name="regiao_id"
              label="Região de rota"
              defaultValue={local.regiao_id ?? ""}
            >
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
          <CamposEndereco
            defaultValues={{
              cep: local.cep ?? "",
              logradouro: local.logradouro ?? "",
              numero: local.numero ?? "",
              complemento: local.complemento ?? "",
              bairro: local.bairro ?? "",
              cidade: local.cidade ?? "",
              uf: local.uf ?? "",
            }}
          />

          <h2 className="mt-2 border-t border-borda pt-4 text-base font-bold">
            Responsável no local
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="responsavel_nome"
              label="Nome"
              defaultValue={local.responsavel_nome ?? ""}
            />
            <TextField
              name="responsavel_telefone"
              label="Telefone"
              defaultValue={local.responsavel_telefone ?? ""}
            />
          </div>
          <TextField
            name="como_chegar"
            label="Como chegar e observações"
            defaultValue={local.como_chegar ?? ""}
          />

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
