"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SexoAnimal = Database["public"]["Enums"]["sexo_animal"];

function camposAnimal(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    raca: String(formData.get("raca") ?? "") || null,
    sexo: (String(formData.get("sexo") ?? "") || null) as SexoAnimal | null,
    pelagem: String(formData.get("pelagem") ?? "") || null,
    nascimento: String(formData.get("nascimento") ?? "") || null,
    registro: String(formData.get("registro") ?? "") || null,
    associacao: String(formData.get("associacao") ?? "") || null,
    chip: String(formData.get("chip") ?? "") || null,
    local_id: String(formData.get("local_id") ?? "") || null,
  };
}

export async function criarAnimal(formData: FormData) {
  const clienteId = String(formData.get("cliente_id") ?? "");
  if (!clienteId) {
    throw new Error("Selecione o proprietário do animal.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animais")
    .insert({ ...camposAnimal(formData), cliente_id: clienteId })
    .select("id")
    .single();

  if (error) {
    throw new Error("Não foi possível salvar o animal: " + error.message);
  }

  redirect(`/animais/${data.id}`);
}

export async function atualizarAnimal(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("animais")
    .update(camposAnimal(formData))
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível salvar o animal: " + error.message);
  }

  revalidatePath(`/animais/${id}`);
  redirect(`/animais/${id}`);
}
