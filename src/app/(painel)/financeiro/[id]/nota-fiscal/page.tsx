import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, TextField } from "@/components/ui";
import { emitirNotaFiscal } from "../../actions";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EmitirNotaFiscalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cobranca } = await supabase
    .from("cobrancas")
    .select("*, atendimentos(id, numero, clientes(nome))")
    .eq("id", id)
    .single();

  if (!cobranca) notFound();

  const emitirComIds = emitirNotaFiscal.bind(null, id, cobranca.atendimentos!.id);

  return (
    <>
      <PageHeader
        titulo="Emitir nota fiscal"
        descricao={`${cobranca.atendimentos?.clientes?.nome} · ${formatarMoeda(cobranca.valor)} · paga`}
      />
      <Card className="max-w-xl">
        <form action={emitirComIds} className="flex flex-col gap-4">
          <TextField name="numero" label="Número da nota" />
          <TextField name="link" label="Link da nota" placeholder="https://..." />
          <div className="mt-2 flex justify-end">
            <Button type="submit">Registrar e concluir atendimento</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
