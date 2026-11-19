import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, Select, TextField } from "@/components/ui";
import { enviarCobranca } from "../../actions";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EnviarCobrancaPage({
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

  const enviarComIds = enviarCobranca.bind(null, id, cobranca.atendimentos!.id);

  return (
    <>
      <PageHeader
        titulo="Enviar cobrança"
        descricao={`${cobranca.atendimentos?.clientes?.nome} · ${formatarMoeda(cobranca.valor)}`}
      />
      <Card className="max-w-xl">
        <form action={enviarComIds} className="flex flex-col gap-4">
          <Select name="forma_pagamento" label="Forma de pagamento" defaultValue="">
            <option value="">A combinar</option>
            <option value="pix">Pix</option>
            <option value="cartao_credito">Cartão de crédito</option>
            <option value="cartao_debito">Cartão de débito</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="transferencia">Transferência</option>
            <option value="boleto">Boleto</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <TextField name="parcelas" label="Parcelas" type="number" min="1" defaultValue="1" />
            <TextField name="vencimento" label="Vencimento" type="date" />
          </div>
          <div className="mt-2 flex justify-end">
            <Button type="submit">Enviar cobrança</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
