import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { CATEGORIAS_SERVICO, UNIDADES_COBRANCA_SERVICO } from "@/lib/catalogoOpcoes";
import { atualizarServico } from "../../actions";

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: servico } = await supabase
    .from("servicos")
    .select("*")
    .eq("id", id)
    .single();

  if (!servico) notFound();

  const [{ data: veterinarios }, { data: fichaModelos }] = await Promise.all([
    supabase.from("usuarios").select("id, nome").eq("perfil", "veterinario").eq("ativo", true),
    supabase.from("ficha_modelos").select("nome").order("nome"),
  ]);

  const atualizarComId = atualizarServico.bind(null, id);

  return (
    <>
      <PageHeader titulo={`Editar · ${servico.nome}`} />
      <Card className="max-w-2xl">
        <form action={atualizarComId} className="flex flex-col gap-4">
          <TextField name="nome" label="Nome" defaultValue={servico.nome} required />
          <Select name="categoria" label="Categoria" defaultValue={servico.categoria ?? ""}>
            <option value="">Sem categoria</option>
            {CATEGORIAS_SERVICO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select
              name="unidade_cobranca"
              label="Cobrança"
              defaultValue={servico.unidade_cobranca}
            >
              {Object.entries(UNIDADES_COBRANCA_SERVICO).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </Select>
            <TextField
              name="valor"
              label="Valor (R$)"
              type="number"
              step="0.01"
              min="0"
              defaultValue={servico.valor}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="duracao_media_minutos"
              label="Duração média (minutos)"
              type="number"
              min="0"
              defaultValue={servico.duracao_media_minutos ?? ""}
            />
            <TextField
              name="retorno_dias"
              label="Retorno sugerido (dias)"
              type="number"
              min="0"
              defaultValue={servico.retorno_dias ?? ""}
            />
          </div>
          <Select name="tipo_ficha" label="Ficha de atendimento" defaultValue={servico.tipo_ficha ?? ""}>
            <option value="">Sem ficha</option>
            {(fichaModelos ?? []).map((f) => (
              <option key={f.nome} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </Select>
          <Select
            name="quem_realiza_id"
            label="Quem realiza"
            defaultValue={servico.quem_realiza_id ?? ""}
          >
            <option value="">Fabi ou Bruno</option>
            {(veterinarios ?? []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </Select>
          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              name="ativo"
              defaultChecked={servico.ativo}
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
