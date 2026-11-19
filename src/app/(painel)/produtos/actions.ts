"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { CATEGORIA_POR_CLASSE } from "@/lib/catalogoOpcoes";

type UnidadeUso = Database["public"]["Enums"]["unidade_uso_produto"];

function camposProduto(formData: FormData) {
  const classe = String(formData.get("classe") ?? "");

  return {
    classe,
    nome_comercial: String(formData.get("nome_comercial") ?? ""),
    concentracao: String(formData.get("concentracao") ?? "") || null,
    fabricante: String(formData.get("fabricante") ?? "") || null,
    categoria: CATEGORIA_POR_CLASSE[classe] ?? null,
    unidade_uso: String(formData.get("unidade_uso") ?? "unidade") as UnidadeUso,
    custo: Number(formData.get("custo") ?? 0),
    preco_venda: Number(formData.get("preco_venda") ?? 0),
    estoque_minimo: Number(formData.get("estoque_minimo") ?? 0),
    cobrar_cliente_padrao: formData.get("cobrar_cliente_padrao") === "on",
    controla_lote_validade: formData.get("controla_lote_validade") === "on",
    ativo: formData.get("ativo") === "on",
  };
}

export async function criarProduto(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .insert(camposProduto(formData))
    .select("id")
    .single();

  if (error) {
    throw new Error("Não foi possível salvar o produto: " + error.message);
  }

  redirect(`/produtos?id=${data.id}`);
}

export async function atualizarProduto(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("produtos")
    .update(camposProduto(formData))
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível salvar o produto: " + error.message);
  }

  revalidatePath("/produtos");
  redirect(`/produtos?id=${id}`);
}
