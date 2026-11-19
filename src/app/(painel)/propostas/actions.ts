"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function criarAtendimento(formData: FormData) {
  const clienteId = String(formData.get("cliente_id") ?? "");
  const animalId = String(formData.get("animal_id") ?? "") || null;

  if (!clienteId) {
    throw new Error("Selecione o cliente.");
  }

  const supabase = await createClient();

  let localId: string | null = null;
  if (animalId) {
    const { data: animal } = await supabase
      .from("animais")
      .select("local_id")
      .eq("id", animalId)
      .single();
    localId = animal?.local_id ?? null;
  }

  const { data, error } = await supabase
    .from("atendimentos")
    .insert({ cliente_id: clienteId, local_id: localId })
    .select("id")
    .single();

  if (error) {
    throw new Error("Não foi possível criar a proposta: " + error.message);
  }

  const destino = animalId
    ? `/propostas/${data.id}?animalId=${animalId}`
    : `/propostas/${data.id}`;
  redirect(destino);
}

function camposCondicoes(formData: FormData) {
  const desconto = Number(formData.get("desconto") ?? 0);
  const validadeDias = Number(formData.get("validade_dias") ?? 15);
  const veterinarioId = String(formData.get("veterinario_id") ?? "") || null;
  const observacoes = String(formData.get("observacoes") ?? "") || null;

  const validade = new Date();
  validade.setDate(validade.getDate() + validadeDias);

  return {
    desconto,
    validade_proposta: validade.toISOString().slice(0, 10),
    veterinario_id: veterinarioId,
    observacoes,
  };
}

export async function salvarRascunho(atendimentoId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("atendimentos")
    .update(camposCondicoes(formData))
    .eq("id", atendimentoId);

  if (error) {
    throw new Error("Não foi possível salvar as condições: " + error.message);
  }

  revalidatePath(`/propostas/${atendimentoId}`);
}

export async function adicionarItem(atendimentoId: string, formData: FormData) {
  const supabase = await createClient();
  const tipo = String(formData.get("tipo") ?? "");
  const animalId = String(formData.get("animal_id") ?? "") || null;
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
      animal_id: animalId,
      tipo: "servico",
      servico_id: servicoId,
      quantidade,
      valor_unitario: servico?.valor ?? 0,
    });
    if (error) throw new Error("Não foi possível adicionar o serviço: " + error.message);
  } else if (tipo === "produto") {
    const produtoId = String(formData.get("produto_id") ?? "");
    const { data: produto } = await supabase
      .from("produtos")
      .select("preco_venda, cobrar_cliente_padrao")
      .eq("id", produtoId)
      .single();

    const { error } = await supabase.from("atendimento_itens").insert({
      atendimento_id: atendimentoId,
      animal_id: animalId,
      tipo: "produto",
      produto_id: produtoId,
      quantidade,
      valor_unitario: produto?.preco_venda ?? 0,
      cobrar: produto?.cobrar_cliente_padrao ?? true,
    });
    if (error) throw new Error("Não foi possível adicionar o produto: " + error.message);
  } else if (tipo === "deslocamento") {
    const regiaoId = String(formData.get("regiao_id") ?? "");
    const { data: regiao } = await supabase
      .from("regioes")
      .select("valor_deslocamento_km")
      .eq("id", regiaoId)
      .single();

    const { error } = await supabase.from("atendimento_itens").insert({
      atendimento_id: atendimentoId,
      tipo: "deslocamento",
      quantidade,
      valor_unitario: regiao?.valor_deslocamento_km ?? 0,
    });
    if (error) throw new Error("Não foi possível adicionar o deslocamento: " + error.message);
  }

  revalidatePath(`/propostas/${atendimentoId}`);
}

export async function removerItem(atendimentoId: string, itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("atendimento_itens").delete().eq("id", itemId);

  if (error) {
    throw new Error("Não foi possível remover o item: " + error.message);
  }

  revalidatePath(`/propostas/${atendimentoId}`);
}

export async function enviarProposta(atendimentoId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("atendimentos")
    .update({
      ...camposCondicoes(formData),
      etapa: "aguardando_aprovacao",
      data_orcamento: new Date().toISOString(),
    })
    .eq("id", atendimentoId);

  if (error) {
    throw new Error("Não foi possível enviar a proposta: " + error.message);
  }

  revalidatePath("/fluxo");
  revalidatePath(`/propostas/${atendimentoId}`);
  redirect(`/propostas/${atendimentoId}`);
}

export async function registrarResposta(atendimentoId: string, aprovado: boolean) {
  const supabase = await createClient();

  const dados = aprovado
    ? { etapa: "a_agendar" as const, data_aprovacao: new Date().toISOString() }
    : { etapa: "recusado" as const };

  const { error } = await supabase.from("atendimentos").update(dados).eq("id", atendimentoId);

  if (error) {
    throw new Error("Não foi possível registrar a resposta: " + error.message);
  }

  revalidatePath("/fluxo");
  revalidatePath(`/propostas/${atendimentoId}`);
  redirect("/fluxo");
}
