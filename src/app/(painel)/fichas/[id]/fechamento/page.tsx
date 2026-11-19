import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, PageHeader, StatusTag, TextField } from "@/components/ui";
import { ChecklistPrevistos } from "./ChecklistPrevistos";
import { ServicosExtras, MateriaisUsados } from "./ExtrasEMateriais";
import { enviarParaFinanceiro, salvarFechamentoDepois } from "../../actions";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function FechamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: atendimento } = await supabase
    .from("atendimentos")
    .select("*, clientes(nome), locais(nome, cidade), usuarios(nome)")
    .eq("id", id)
    .single();

  if (!atendimento) notFound();

  const [{ data: itens }, { data: fichas }, { data: servicos }, { data: produtos }] =
    await Promise.all([
      supabase
        .from("atendimento_itens")
        .select(
          "id, tipo, origem, quantidade, valor_unitario, valor_total, cobrar, realizado, servicos(nome), produtos(nome_completo), animais(nome)",
        )
        .eq("atendimento_id", id)
        .order("created_at"),
      supabase
        .from("fichas")
        .select("id, animais(nome), created_at, ficha_modelos(nome)")
        .eq("atendimento_id", id),
      supabase.from("servicos").select("id, nome, valor").eq("ativo", true).order("nome"),
      supabase
        .from("produtos")
        .select("id, nome_completo, preco_venda")
        .eq("ativo", true)
        .order("nome_completo"),
    ]);

  const previstos = (itens ?? [])
    .filter((i) => i.origem === "proposta" && i.tipo !== "deslocamento")
    .map((i) => ({
      id: i.id,
      nome: i.tipo === "servico" ? (i.servicos?.nome ?? "Serviço") : (i.produtos?.nome_completo ?? "Produto"),
      valor: i.valor_total ?? 0,
      realizado: i.realizado,
    }));

  const extras = (itens ?? [])
    .filter((i) => i.origem === "extra" && i.tipo === "servico")
    .map((i) => ({ id: i.id, nome: i.servicos?.nome ?? "Serviço", valor: i.valor_total ?? 0 }));

  const materiais = (itens ?? [])
    .filter((i) => i.tipo === "produto")
    .map((i) => ({
      id: i.id,
      nome: i.produtos?.nome_completo ?? "Produto",
      quantidade: i.quantidade,
      cobrar: i.cobrar,
      valor: i.valor_total ?? 0,
    }));

  const propostaAprovada = (itens ?? [])
    .filter((i) => i.origem === "proposta")
    .reduce((soma, i) => soma + (i.valor_total ?? 0), 0);
  const servicosExtrasTotal = extras.reduce((soma, i) => soma + i.valor, 0);
  const materiaisCobrados = materiais
    .filter((m) => m.cobrar)
    .reduce((soma, m) => soma + m.valor, 0);
  const acimaDaProposta = atendimento.total - propostaAprovada;

  const enviarComId = enviarParaFinanceiro.bind(null, id);
  const salvarComId = salvarFechamentoDepois.bind(null, id);

  return (
    <>
      <div className="-mb-3 text-sm">
        <Link href="/fluxo" className="font-semibold">
          Fluxo
        </Link>
        <span className="text-texto-secundario"> › 5. Registrar atendimento</span>
      </div>
      <PageHeader
        titulo="Fechamento do atendimento"
        descricao={[
          atendimento.clientes?.nome,
          atendimento.locais?.cidade,
          atendimento.usuarios?.nome && `atendido por ${atendimento.usuarios.nome}`,
        ]
          .filter(Boolean)
          .join(" · ")}
      />

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borda bg-superficie p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold">Fichas deste atendimento</h2>
              <p className="text-sm text-texto-secundario">
                {(fichas ?? []).length === 0
                  ? "Nenhuma ficha preenchida ainda."
                  : (fichas ?? [])
                      .map((f) => `${f.animais?.nome ?? "Animal"} (${f.ficha_modelos?.nome ?? "sem tipo"})`)
                      .join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusTag situacao={(fichas ?? []).length > 0 ? "em-dia" : "atencao"}>
                {(fichas ?? []).length > 0 ? "Preenchida" : "Pendente"}
              </StatusTag>
              <Link href={`/fichas/${id}`} className="text-sm font-semibold">
                Ver ficha
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-2.5 rounded-xl border border-borda bg-superficie p-5">
            <h2 className="text-base font-bold">Previsto na proposta</h2>
            <p className="text-sm text-texto-secundario">Desmarque o que não foi realizado.</p>
            <ChecklistPrevistos atendimentoId={id} itens={previstos} />
          </section>

          <ServicosExtras atendimentoId={id} itens={extras} servicos={servicos ?? []} />
          <MateriaisUsados atendimentoId={id} itens={materiais} produtos={produtos ?? []} />
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-xl border border-borda bg-superficie p-5">
          <h2 className="font-titulo text-[22px] font-normal">Resumo</h2>
          <dl className="flex flex-col gap-2.5 text-[15px]">
            <div className="flex justify-between gap-3">
              <dt className="text-texto-secundario">Proposta aprovada</dt>
              <dd>{formatarMoeda(propostaAprovada)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-texto-secundario">Serviços extras</dt>
              <dd>{formatarMoeda(servicosExtrasTotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-texto-secundario">Materiais cobrados</dt>
              <dd>{formatarMoeda(materiaisCobrados)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-borda pt-3">
              <dt className="font-bold">Total a faturar</dt>
              <dd className="font-titulo text-[28px] text-bordo">{formatarMoeda(atendimento.total)}</dd>
            </div>
          </dl>
          {acimaDaProposta > 0.004 && (
            <div className="rounded-lg bg-situacao-atencao-bg px-3 py-2.5 text-sm text-situacao-atencao-fg">
              {formatarMoeda(acimaDaProposta)} acima da proposta. O financeiro verá o que foi
              acrescentado.
            </div>
          )}
          <form id="form-fechamento" className="flex flex-col gap-3.5">
            <TextField
              name="observacoes_financeiro"
              label="Observação para o financeiro"
              defaultValue={atendimento.observacoes_financeiro ?? ""}
              placeholder="Ex.: cliente pediu para pagar por Pix"
            />
          </form>
          <Button type="submit" form="form-fechamento" formAction={enviarComId} className="w-full">
            Enviar para o financeiro
          </Button>
          <Button
            type="submit"
            form="form-fechamento"
            formAction={salvarComId}
            variante="secundario"
            className="w-full"
          >
            Salvar e continuar depois
          </Button>
        </aside>
      </div>
    </>
  );
}
