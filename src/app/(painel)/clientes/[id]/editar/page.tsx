import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, TextField } from "@/components/ui";
import { CamposEndereco } from "@/components/forms/CamposEndereco";
import { atualizarCliente } from "../../actions";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cliente) notFound();

  const atualizarComId = atualizarCliente.bind(null, id);

  return (
    <>
      <PageHeader titulo={`Editar · ${cliente.nome}`} />
      <Card className="max-w-2xl">
        <form action={atualizarComId} className="flex flex-col gap-4">
          <TextField
            name="nome"
            label="Nome completo"
            defaultValue={cliente.nome}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="documento"
              label="CPF ou CNPJ"
              defaultValue={cliente.documento ?? ""}
            />
            <TextField
              name="telefone"
              label="Telefone com WhatsApp"
              defaultValue={cliente.telefone ?? ""}
            />
          </div>
          <TextField
            name="email"
            label="E-mail"
            type="email"
            defaultValue={cliente.email ?? ""}
          />
          <TextField
            name="indicado_por"
            label="Indicado por"
            defaultValue={cliente.indicado_por ?? ""}
          />

          <h2 className="mt-2 border-t border-borda pt-4 text-base font-bold">
            Endereço
          </h2>
          <CamposEndereco
            defaultValues={{
              cep: cliente.cep ?? "",
              logradouro: cliente.logradouro ?? "",
              numero: cliente.numero ?? "",
              complemento: cliente.complemento ?? "",
              bairro: cliente.bairro ?? "",
              cidade: cliente.cidade ?? "",
              uf: cliente.uf ?? "",
            }}
          />

          <TextField
            name="observacoes"
            label="Observações"
            defaultValue={cliente.observacoes ?? ""}
          />

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
