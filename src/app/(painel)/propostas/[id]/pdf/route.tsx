import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { PropostaDocument } from "@/lib/pdf/PropostaDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: atendimento } = await supabase
    .from("atendimentos")
    .select("*, clientes(nome, telefone, email), locais(nome), usuarios(nome)")
    .eq("id", id)
    .single();

  if (!atendimento) {
    return new Response("Proposta não encontrada.", { status: 404 });
  }

  const { data: itens } = await supabase
    .from("atendimento_itens")
    .select(
      "quantidade, valor_unitario, valor_total, tipo, servicos(nome, categoria), produtos(nome_completo), animais(nome)",
    )
    .eq("atendimento_id", id)
    .order("created_at");

  const itensFormatados = (itens ?? []).map((item) => {
    const nome =
      item.tipo === "servico"
        ? (item.servicos?.nome ?? "Serviço")
        : item.tipo === "produto"
          ? (item.produtos?.nome_completo ?? "Produto")
          : "Deslocamento";
    const info =
      item.tipo === "servico"
        ? (item.servicos?.categoria ?? "")
        : item.tipo === "deslocamento"
          ? ""
          : "";

    return {
      nome,
      info,
      quantidade: item.quantidade,
      valorUnitario: item.valor_unitario,
      valorTotal: item.valor_total ?? 0,
    };
  });

  const subtotal = itensFormatados.reduce((soma, i) => soma + i.valorTotal, 0);

  const animaisDistintos = Array.from(
    new Set((itens ?? []).map((i) => i.animais?.nome).filter((nome): nome is string => Boolean(nome))),
  );
  const animalNome =
    animaisDistintos.length === 1
      ? animaisDistintos[0]
      : animaisDistintos.length > 1
        ? `${animaisDistintos.length} animais`
        : null;

  const buffer = await renderToBuffer(
    <PropostaDocument
      numero={atendimento.numero}
      dataEmissao={atendimento.data_orcamento ?? atendimento.created_at}
      validade={atendimento.validade_proposta}
      cliente={{
        nome: atendimento.clientes?.nome ?? "",
        telefone: atendimento.clientes?.telefone ?? null,
        email: atendimento.clientes?.email ?? null,
      }}
      animalNome={animalNome}
      localNome={atendimento.locais?.nome ?? null}
      veterinarioNome={atendimento.usuarios?.nome ?? null}
      observacoes={atendimento.observacoes}
      itens={itensFormatados}
      subtotal={subtotal}
      desconto={atendimento.desconto}
      total={atendimento.total}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="proposta-${atendimento.numero}.pdf"`,
    },
  });
}
