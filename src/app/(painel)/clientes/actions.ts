"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function camposCliente(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    documento: String(formData.get("documento") ?? "") || null,
    telefone: String(formData.get("telefone") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    cep: String(formData.get("cep") ?? "") || null,
    logradouro: String(formData.get("logradouro") ?? "") || null,
    numero: String(formData.get("numero") ?? "") || null,
    complemento: String(formData.get("complemento") ?? "") || null,
    bairro: String(formData.get("bairro") ?? "") || null,
    cidade: String(formData.get("cidade") ?? "") || null,
    uf: String(formData.get("uf") ?? "") || null,
    indicado_por: String(formData.get("indicado_por") ?? "") || null,
    observacoes: String(formData.get("observacoes") ?? "") || null,
  };
}

export async function criarCliente(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .insert(camposCliente(formData))
    .select("id")
    .single();

  if (error) {
    throw new Error("Não foi possível salvar o cliente: " + error.message);
  }

  redirect(`/clientes/${data.id}`);
}

export async function atualizarCliente(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update(camposCliente(formData))
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível salvar o cliente: " + error.message);
  }

  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function gerarConvite(clienteId: string | null) {
  const supabase = await createClient();
  const validade = new Date();
  validade.setDate(validade.getDate() + 14);

  const { data, error } = await supabase
    .from("convites_cadastro")
    .insert({ cliente_id: clienteId, validade: validade.toISOString() })
    .select("token")
    .single();

  if (error) {
    throw new Error("Não foi possível gerar o convite: " + error.message);
  }

  if (clienteId) {
    revalidatePath(`/clientes/${clienteId}`);
  } else {
    revalidatePath("/clientes");
  }

  return data.token as string;
}
