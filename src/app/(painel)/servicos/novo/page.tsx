import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { CATEGORIAS_SERVICO, UNIDADES_COBRANCA_SERVICO } from "@/lib/catalogoOpcoes";
import { criarServico } from "../actions";

export default async function NovoServicoPage() {
  const supabase = await createClient();
  const [{ data: veterinarios }, { data: fichaModelos }] = await Promise.all([
    supabase.from("usuarios").select("id, nome").eq("perfil", "veterinario").eq("ativo", true),
    supabase.from("ficha_modelos").select("nome").order("nome"),
  ]);

  return (
    <>
      <PageHeader titulo="Novo serviço" />
      <Card className="max-w-2xl">
        <form action={criarServico} className="flex flex-col gap-4">
          <TextField name="nome" label="Nome" required />
          <Select name="categoria" label="Categoria" defaultValue="">
            <option value="">Sem categoria</option>
            {CATEGORIAS_SERVICO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select name="unidade_cobranca" label="Cobrança" defaultValue="sessao">
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
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="duracao_media_minutos"
              label="Duração média (minutos)"
              type="number"
              min="0"
            />
            <TextField name="retorno_dias" label="Retorno sugerido (dias)" type="number" min="0" />
          </div>
          <Select name="tipo_ficha" label="Ficha de atendimento" defaultValue="">
            <option value="">Sem ficha</option>
            {(fichaModelos ?? []).map((f) => (
              <option key={f.nome} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </Select>
          <Select name="quem_realiza_id" label="Quem realiza" defaultValue="">
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
              defaultChecked
              className="h-5 w-5 accent-bordo"
            />
            Ativo no catálogo
          </label>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit">Salvar serviço</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
