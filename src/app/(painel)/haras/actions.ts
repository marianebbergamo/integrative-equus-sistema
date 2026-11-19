"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type TipoLocal = Database["public"]["Enums"]["tipo_local"];

function camposLocal(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    tipo: String(formData.get("tipo") ?? "haras") as TipoLocal,
    cep: String(formData.get("cep") ?? "") || null,
    logradouro: String(formData.get("logradouro") ?? "") || null,
    numero: String(formData.get("numero") ?? "") || null,
    complemento: String(formData.get("complemento") ?? "") || null,
    bairro: String(formData.get("bairro") ?? "") || null,
    cidade: String(formData.get("cidade") ?? "") || null,
    uf: String(formData.get("uf") ?? "") || null,
    regiao_id: String(formData.get("regiao_id") ?? "") || null,
    responsavel_nome: String(formData.get("responsavel_nome") ?? "") || null,
    responsavel_telefone:
      String(formData.get("responsavel_telefone") ?? "") || null,
    como_chegar: String(formData.get("como_chegar") ?? "") || null,
  };
}

export async function criarLocal(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locais")
    .insert(camposLocal(formData))
    .select("id")
    .single();

  if (error) {
    throw new Error("Não foi possível salvar o local: " + error.message);
  }

  redirect(`/haras?id=${data.id}`);
}

export async function atualizarLocal(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locais")
    .update(camposLocal(formData))
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível salvar o local: " + error.message);
  }

  revalidatePath("/haras");
  redirect(`/haras?id=${id}`);
}
