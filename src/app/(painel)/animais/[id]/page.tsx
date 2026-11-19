import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader } from "@/components/ui";

function idade(nascimento: string | null) {
  if (!nascimento) return null;
  const anos = Math.floor(
    (Date.now() - new Date(nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  return anos;
}

export default async function AnimalDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: animal } = await supabase
    .from("animais")
    .select("*, clientes(id, nome, cidade), locais(id, nome, cidade, regioes(nome))")
    .eq("id", id)
    .single();

  if (!animal) notFound();

  const anos = idade(animal.nascimento);

  return (
    <>
      <PageHeader
        titulo={animal.nome}
        descricao={[animal.raca, animal.sexo === "femea" ? "égua" : animal.sexo === "macho" ? "macho" : null, animal.pelagem, anos !== null && `${anos} anos`]
          .filter(Boolean)
          .join(" · ")}
        acoes={
          <Link href={`/animais/${id}/editar`}>
            <Button variante="secundario">Editar dados</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-start gap-5">
        <Card className="flex min-w-0 flex-[999_1_520px] flex-col gap-3">
          <h2 className="font-titulo text-[22px] font-normal">Dados</h2>
          <dl className="flex flex-col gap-3 text-[15px]">
            <div>
              <dt className="text-[13px] text-texto-secundario">Registro</dt>
              <dd>
                {animal.registro ?? "—"}
                {animal.associacao && ` · ${animal.associacao}`}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-texto-secundario">Chip</dt>
              <dd>{animal.chip ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-texto-secundario">Nascimento</dt>
              <dd>
                {animal.nascimento
                  ? new Date(animal.nascimento).toLocaleDateString("pt-BR")
                  : "—"}
              </dd>
            </div>
          </dl>
          <div className="rounded-lg bg-situacao-informacao-bg px-3 py-2 text-sm text-situacao-informacao-fg">
            Prontuário e fichas de atendimento chegam em uma etapa futura.
          </div>
        </Card>

        <Card className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
          <h2 className="text-base font-bold">Proprietário e local</h2>
          <dl className="flex flex-col gap-2.5 text-[15px]">
            <div>
              <dt className="text-[13px] text-texto-secundario">Proprietário</dt>
              <dd>
                <Link href={`/clientes/${animal.clientes?.id}`} className="font-semibold">
                  {animal.clientes?.nome}
                </Link>
                {animal.clientes?.cidade && ` · ${animal.clientes.cidade}`}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-texto-secundario">Onde o animal fica</dt>
              <dd>
                {animal.locais ? (
                  <>
                    <Link href={`/haras?id=${animal.locais.id}`} className="font-semibold">
                      {animal.locais.nome}
                    </Link>
                    {animal.locais.cidade && ` · ${animal.locais.cidade}`}
                  </>
                ) : (
                  "No endereço do proprietário"
                )}
              </dd>
            </div>
            {animal.locais?.regioes?.nome && (
              <div>
                <dt className="text-[13px] text-texto-secundario">Região de rota</dt>
                <dd>{animal.locais.regioes.nome}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </>
  );
}
