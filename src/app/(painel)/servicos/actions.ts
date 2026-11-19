"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type UnidadeCobranca = Database["public"]["Enums"]["unidade_cobranca_servico"];

function camposServico(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    categoria: String(formData.get("categoria") ?? "") || null,
    unidade_cobranca: String(formData.get("unidade_cobranca") ?? "sessao") as UnidadeCobranca,
    valor: Number(formData.get("valor") ?? 0),
    duracao_media_minutos: Number(formData.get("duracao_media_minutos") ?? 0) || null,
    retorno_dias: Number(formData.get("retorno_dias") ?? 0) || null,
    tipo_ficha: String(formData.get("tipo_ficha") ?? "") || null,
    quem_realiza_id: String(formData.get("quem_realiza_id") ?? "") || null,
    ativo: formData.get("ativo") === "on",
  };
}

export async function criarServico(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicos")
    .insert(camposServico(formData))
    .select("id")
    .single();

  if (error) {
    throw new Error("Não foi possível salvar o serviço: " + error.message);
  }

  redirect(`/servicos?id=${data.id}`);
}

export async function atualizarServico(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("servicos")
    .update(camposServico(formData))
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível salvar o serviço: " + error.message);
  }

  revalidatePath("/servicos");
  redirect(`/servicos?id=${id}`);
}

export async function atualizarRegioes(regiaoIds: string[], formData: FormData) {
  const supabase = await createClient();

  for (const id of regiaoIds) {
    const valor = Number(formData.get(`valor_${id}`) ?? 0);
    const { error } = await supabase
      .from("regioes")
      .update({ valor_deslocamento_km: valor })
      .eq("id", id);

    if (error) {
      throw new Error("Não foi possível salvar a tabela: " + error.message);
    }
  }

  revalidatePath("/servicos");
  revalidatePath("/servicos/regioes");
  redirect("/servicos");
}
