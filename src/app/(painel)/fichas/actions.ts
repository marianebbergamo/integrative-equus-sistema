"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function salvarFicha(
  atendimentoId: string,
  animalId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fichaModeloId = String(formData.get("ficha_modelo_id") ?? "") || null;
  const queixa = String(formData.get("queixa") ?? "");
  const orientacoesTutor = String(formData.get("orientacoes_tutor") ?? "") || null;
  const retornoDias = Number(formData.get("retorno_dias") ?? 0) || null;

  const { data: existente } = await supabase
    .from("fichas")
    .select("id")
    .eq("atendimento_id", atendimentoId)
    .eq("animal_id", animalId)
    .maybeSingle();

  const campos = {
    atendimento_id: atendimentoId,
    animal_id: animalId,
    ficha_modelo_id: fichaModeloId,
    respostas: { queixa },
    orientacoes_tutor: orientacoesTutor,
    retorno_sugerido_dias: retornoDias,
    veterinario_id: user?.id ?? null,
  };

  let fichaId = existente?.id ?? null;

  if (fichaId) {
    const { error } = await supabase.from("fichas").update(campos).eq("id", fichaId);
    if (error) throw new Error("Não foi possível salvar a ficha: " + error.message);
  } else {
    const { data: nova, error } = await supabase
      .from("fichas")
      .insert(campos)
      .select("id")
      .single();
    if (error) throw new Error("Não foi possível salvar a ficha: " + error.message);
    fichaId = nova.id;
  }

  const itemIds = formData.getAll("item_id").map(String);
  for (const itemId of itemIds) {
    const realizado = formData.get(`realizado_${itemId}`) === "on";
    await supabase.from("atendimento_itens").update({ realizado }).eq("id", itemId);
  }

  revalidatePath(`/fichas/${atendimentoId}`);
  return fichaId;
}

export async function enviarParaFechamento(
  atendimentoId: string,
  animalId: string,
  formData: FormData,
) {
  await salvarFicha(atendimentoId, animalId, formData);
  redirect(`/fichas/${atendimentoId}/fechamento`);
}

export async function anexarFotoFicha(fichaId: string, atendimentoId: string, formData: FormData) {
  const supabase = await createClient();
  const arquivo = formData.get("arquivo") as File | null;

  if (!arquivo || arquivo.size === 0) {
    throw new Error("Escolha uma foto ou vídeo para anexar.");
  }

  const caminho = `${fichaId}/${Date.now()}-${arquivo.name}`;
  const { error: erroUpload } = await supabase.storage
    .from("fichas")
    .upload(caminho, arquivo);

  if (erroUpload) {
    throw new Error("Não foi possível enviar o arquivo: " + erroUpload.message);
  }

  const { error } = await supabase.from("ficha_arquivos").insert({
    ficha_id: fichaId,
    tipo: arquivo.type.startsWith("video") ? "video" : "foto",
    url: caminho,
  });

  if (error) {
    throw new Error("Não foi possível salvar o anexo: " + error.message);
  }

  revalidatePath(`/fichas/${atendimentoId}`);
}

export async function toggleItemRealizado(
  atendimentoId: string,
  itemId: string,
  realizado: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("atendimento_itens")
    .update({ realizado })
    .eq("id", itemId);

  if (error) {
    throw new Error("Não foi possível atualizar o item: " + error.message);
  }

  revalidatePath(`/fichas/${atendimentoId}/fechamento`);
}

export async function adicionarItemExtra(atendimentoId: string, formData: FormData) {
  const supabase = await createClient();
  const tipo = String(formData.get("tipo") ?? "");
  const quantidade = Number(formData.get("quantidade") ?? 1);

  if (tipo === "servico") {
    const servicoId = String(formData.get("servico_id") ?? "");
    const { data: servico } = await supabase
      .from("servicos")
      .select("valor")
      .eq("id", servicoId)
      .single();

    const { error } = await supabase.from("atendimento_itens").insert({
      atendimento_id: atendimentoId,
      tipo: "servico",
      origem: "extra",
      servico_id: servicoId,
      quantidade,
      valor_unitario: servico?.valor ?? 0,
      realizado: true,
    });
    if (error) throw new Error("Não foi possível adicionar o serviço: " + error.message);
  } else if (tipo === "produto") {
    const produtoId = String(formData.get("produto_id") ?? "");
    const cobrar = formData.get("cobrar") === "on";
    const { data: produto } = await supabase
      .from("produtos")
      .select("preco_venda")
      .eq("id", produtoId)
      .single();

    const { error } = await supabase.from("atendimento_itens").insert({
      atendimento_id: atendimentoId,
      tipo: "produto",
      origem: "extra",
      produto_id: produtoId,
      quantidade,
      valor_unitario: produto?.preco_venda ?? 0,
      cobrar,
      realizado: true,
    });
    if (error) throw new Error("Não foi possível adicionar o produto: " + error.message);
  }

  revalidatePath(`/fichas/${atendimentoId}/fechamento`);
}

export async function removerItemFechamento(atendimentoId: string, itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("atendimento_itens").delete().eq("id", itemId);

  if (error) {
    throw new Error("Não foi possível remover o item: " + error.message);
  }

  revalidatePath(`/fichas/${atendimentoId}/fechamento`);
}

export async function salvarFechamentoDepois(atendimentoId: string, formData: FormData) {
  const supabase = await createClient();
  const observacoesFinanceiro = String(formData.get("observacoes_financeiro") ?? "") || null;

  const { error } = await supabase
    .from("atendimentos")
    .update({ observacoes_financeiro: observacoesFinanceiro })
    .eq("id", atendimentoId);

  if (error) {
    throw new Error("Não foi possível salvar: " + error.message);
  }

  revalidatePath(`/fichas/${atendimentoId}/fechamento`);
}

export async function enviarParaFinanceiro(atendimentoId: string, formData: FormData) {
  const supabase = await createClient();
  const observacoesFinanceiro = String(formData.get("observacoes_financeiro") ?? "") || null;

  const { data: atendimento, error: erroAtendimento } = await supabase
    .from("atendimentos")
    .update({
      observacoes_financeiro: observacoesFinanceiro,
      etapa: "a_cobrar",
      data_fechamento: new Date().toISOString(),
    })
    .eq("id", atendimentoId)
    .select("total")
    .single();

  if (erroAtendimento) {
    throw new Error("Não foi possível enviar para o financeiro: " + erroAtendimento.message);
  }

  const { error: erroCobranca } = await supabase.from("cobrancas").insert({
    atendimento_id: atendimentoId,
    valor: atendimento.total,
    situacao: "a_vencer",
  });

  if (erroCobranca) {
    throw new Error("Não foi possível criar a cobrança: " + erroCobranca.message);
  }

  revalidatePath("/fluxo");
  revalidatePath("/financeiro");
  redirect("/fluxo");
}
