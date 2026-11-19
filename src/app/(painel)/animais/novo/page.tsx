import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { criarAnimal } from "../actions";

export default async function NovoAnimalPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId = "" } = await searchParams;
  const supabase = await createClient();

  const [{ data: clientes }, { data: locais }] = await Promise.all([
    supabase.from("clientes").select("id, nome").order("nome"),
    supabase.from("locais").select("id, nome, cidade").order("nome"),
  ]);

  return (
    <>
      <PageHeader titulo="Novo animal" />
      <Card className="max-w-2xl">
        <form action={criarAnimal} className="flex flex-col gap-4">
          <Select name="cliente_id" label="Proprietário" defaultValue={clienteId} required>
            <option value="">Selecione</option>
            {(clientes ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>

          <TextField name="nome" label="Nome do animal" required />
          <div className="grid grid-cols-2 gap-3">
            <TextField name="raca" label="Raça" />
            <Select name="sexo" label="Sexo" defaultValue="">
              <option value="">Selecione</option>
              <option value="femea">Égua</option>
              <option value="macho">Macho</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField name="nascimento" label="Nascimento" type="date" />
            <TextField name="pelagem" label="Pelagem" />
          </div>
          <TextField name="registro" label="Número do registro" />
          <TextField name="associacao" label="Associação (ABQM, ABCCC...)" />
          <TextField name="chip" label="Chip" />

          <Select name="local_id" label="Onde o animal fica" defaultValue="">
            <option value="">No endereço do proprietário</option>
            {(locais ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome} · {l.cidade}
              </option>
            ))}
          </Select>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar animal</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
