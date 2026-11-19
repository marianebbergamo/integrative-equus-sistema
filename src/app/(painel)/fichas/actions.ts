"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Dá baixa no lote de validade mais próxima com saldo suficiente. Se não
// houver lote com saldo (produto ainda sem entrada registrada no Estoque),
// não bloqueia o fechamento: só não há o que baixar.
async function baixarEstoque(
  supabase: Awaited<ReturnType<typeof createClient>>,
  atendimentoId: string,
  produtoId: string,
  quantidade: number,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lote } = await supabase
    .from("estoque_lotes")
    .select("id, quantidade")
    .eq("produto_id", produtoId)
    .gte("quantidade", quantidade)
    .order("validade", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (!lote) return;

  await supabase.from("estoque_movimentacoes").insert({
    produto_id: produtoId,
    lote_id: lote.id,
    tipo: "saida",
    quantidade,
    atendimento_id: atendimentoId,
    usuario_id: user?.id ?? null,
    motivo: "Atendimento",
  });
}

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

  await sincronizarRetorno(supabase, atendimentoId, animalId, retornoDias);

  revalidatePath(`/fichas/${atendimentoId}`);
  return fichaId;
}

// Mantém no máximo um retorno "a vencer" por animal+serviço vindo desta ficha:
// remove o anterior (ficha pode ser salva de novo com outro prazo) e cria o novo.
async function sincronizarRetorno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  atendimentoId: string,
  animalId: string,
  retornoDias: number | null,
) {
  const { data: item } = await supabase
    .from("atendimento_itens")
    .select("servico_id")
    .eq("atendimento_id", atendimentoId)
    .eq("animal_id", animalId)
    .eq("tipo", "servico")
    .not("servico_id", "is", null)
    .limit(1)
    .maybeSingle();

  let consultaExistente = supabase
    .from("retornos")
    .select("id")
    .eq("animal_id", animalId)
    .eq("situacao", "a_vencer");
  consultaExistente = item?.servico_id
    ? consultaExistente.eq("servico_id", item.servico_id)
    : consultaExistente.is("servico_id", null);
  const { data: existentes } = await consultaExistente;

  if (existentes && existentes.length > 0) {
    await supabase
      .from("retornos")
      .delete()
      .in("id", existentes.map((r) => r.id));
  }

  if (!retornoDias) return;

  const dataPrevista = new Date();
  dataPrevista.setDate(dataPrevista.getDate() + retornoDias);

  await supabase.from("retornos").insert({
    animal_id: animalId,
    servico_id: item?.servico_id ?? null,
    data_prevista: dataPrevista.toISOString().slice(0, 10),
    situacao: "a_vencer",
  });
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
      .select("preco_venda, controla_lote_validade")
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

    if (produto?.controla_lote_validade) {
      await baixarEstoque(supabase, atendimentoId, produtoId, quantidade);
    }
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
