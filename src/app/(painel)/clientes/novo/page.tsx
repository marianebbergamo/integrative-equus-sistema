import { Button, Card, PageHeader, TextField } from "@/components/ui";
import { CamposEndereco } from "@/components/forms/CamposEndereco";
import { criarCliente } from "../actions";

export default function NovoClientePage() {
  return (
    <>
      <PageHeader titulo="Novo cliente" />
      <Card className="max-w-2xl">
        <form action={criarCliente} className="flex flex-col gap-4">
          <TextField name="nome" label="Nome completo" required />
          <div className="grid grid-cols-2 gap-3">
            <TextField name="documento" label="CPF ou CNPJ" />
            <TextField name="telefone" label="Telefone com WhatsApp" />
          </div>
          <TextField name="email" label="E-mail" type="email" />
          <TextField name="indicado_por" label="Indicado por" />

          <h2 className="mt-2 border-t border-borda pt-4 text-base font-bold">
            Endereço
          </h2>
          <CamposEndereco />

          <TextField name="observacoes" label="Observações" />

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar cliente</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
