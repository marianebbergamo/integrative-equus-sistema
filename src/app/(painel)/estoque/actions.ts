"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function registrarMovimentacao(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const produtoId = String(formData.get("produto_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "entrada") as "entrada" | "ajuste";
  const lote = String(formData.get("lote") ?? "") || null;
  const validade = String(formData.get("validade") ?? "") || null;
  const quantidade = Number(formData.get("quantidade") ?? 0);
  const motivo = String(formData.get("motivo") ?? "") || null;

  if (!produtoId || quantidade === 0) {
    throw new Error("Escolha o produto e uma quantidade diferente de zero.");
  }

  let loteId: string;
  let consultaLote = supabase.from("estoque_lotes").select("id").eq("produto_id", produtoId);
  consultaLote = lote ? consultaLote.eq("lote", lote) : consultaLote.is("lote", null);
  consultaLote = validade ? consultaLote.eq("validade", validade) : consultaLote.is("validade", null);
  const { data: loteExistente } = await consultaLote.maybeSingle();

  if (loteExistente) {
    loteId = loteExistente.id;
  } else {
    const { data: novoLote, error: erroLote } = await supabase
      .from("estoque_lotes")
      .insert({ produto_id: produtoId, lote, validade, quantidade: 0 })
      .select("id")
      .single();
    if (erroLote) throw new Error("Não foi possível criar o lote: " + erroLote.message);
    loteId = novoLote.id;
  }

  const quantidadeMovimento = tipo === "entrada" ? Math.abs(quantidade) : quantidade;
  const tipoMovimento = tipo === "entrada" ? "entrada" : "ajuste";

  const { error } = await supabase.from("estoque_movimentacoes").insert({
    produto_id: produtoId,
    lote_id: loteId,
    tipo: tipoMovimento,
    quantidade: quantidadeMovimento,
    motivo,
    usuario_id: user?.id ?? null,
  });

  if (error) {
    throw new Error("Não foi possível registrar a movimentação: " + error.message);
  }

  revalidatePath("/estoque");
  redirect("/estoque");
}
