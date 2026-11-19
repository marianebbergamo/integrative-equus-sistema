import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { atualizarAnimal } from "../../actions";

export default async function EditarAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: animal } = await supabase
    .from("animais")
    .select("*")
    .eq("id", id)
    .single();

  if (!animal) notFound();

  const { data: locais } = await supabase
    .from("locais")
    .select("id, nome, cidade")
    .order("nome");

  const atualizarComId = atualizarAnimal.bind(null, id);

  return (
    <>
      <PageHeader titulo={`Editar · ${animal.nome}`} />
      <Card className="max-w-2xl">
        <form action={atualizarComId} className="flex flex-col gap-4">
          <TextField name="nome" label="Nome do animal" defaultValue={animal.nome} required />
          <div className="grid grid-cols-2 gap-3">
            <TextField name="raca" label="Raça" defaultValue={animal.raca ?? ""} />
            <Select name="sexo" label="Sexo" defaultValue={animal.sexo ?? ""}>
              <option value="">Selecione</option>
              <option value="femea">Égua</option>
              <option value="macho">Macho</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="nascimento"
              label="Nascimento"
              type="date"
              defaultValue={animal.nascimento ?? ""}
            />
            <TextField name="pelagem" label="Pelagem" defaultValue={animal.pelagem ?? ""} />
          </div>
          <TextField name="registro" label="Número do registro" defaultValue={animal.registro ?? ""} />
          <TextField
            name="associacao"
            label="Associação (ABQM, ABCCC...)"
            defaultValue={animal.associacao ?? ""}
          />
          <TextField name="chip" label="Chip" defaultValue={animal.chip ?? ""} />

          <Select name="local_id" label="Onde o animal fica" defaultValue={animal.local_id ?? ""}>
            <option value="">No endereço do proprietário</option>
            {(locais ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome} · {l.cidade}
              </option>
            ))}
          </Select>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
