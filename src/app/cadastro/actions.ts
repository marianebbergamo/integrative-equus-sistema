"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function enviarDadosCliente(token: string, formData: FormData) {
  const supabase = await createClient();
  // As colunas aceitam nulo, mas os tipos gerados para os parâmetros da
  // função não marcam isso — por isso o "as never" abaixo.
  const { error } = await supabase.rpc("cadastrar_cliente_por_convite", {
    p_token: token,
    p_nome: String(formData.get("nome") ?? ""),
    p_documento: String(formData.get("documento") ?? "") || null,
    p_telefone: String(formData.get("telefone") ?? "") || null,
    p_email: String(formData.get("email") ?? "") || null,
    p_cep: String(formData.get("cep") ?? "") || null,
    p_logradouro: String(formData.get("logradouro") ?? "") || null,
    p_numero: String(formData.get("numero") ?? "") || null,
    p_complemento: String(formData.get("complemento") ?? "") || null,
    p_bairro: String(formData.get("bairro") ?? "") || null,
    p_cidade: String(formData.get("cidade") ?? "") || null,
    p_uf: String(formData.get("uf") ?? "") || null,
  } as never);

  if (error) {
    throw new Error("Não foi possível salvar seus dados: " + error.message);
  }

  redirect(`/cadastro?token=${token}&etapa=2`);
}

export async function enviarAnimal(token: string, formData: FormData) {
  const supabase = await createClient();

  const comoFica = String(formData.get("onde_fica") ?? "proprio");
  const localId =
    comoFica === "local" ? String(formData.get("local_id") ?? "") || null : null;

  const { error } = await supabase.rpc("cadastrar_animal_por_convite", {
    p_token: token,
    p_nome: String(formData.get("nome") ?? ""),
    p_raca: String(formData.get("raca") ?? "") || null,
    p_sexo: (String(formData.get("sexo") ?? "") || null) as "macho" | "femea" | null,
    p_pelagem: String(formData.get("pelagem") ?? "") || null,
    p_nascimento: String(formData.get("nascimento") ?? "") || null,
    p_registro: String(formData.get("registro") ?? "") || null,
    p_associacao: String(formData.get("associacao") ?? "") || null,
    p_chip: String(formData.get("chip") ?? "") || null,
    p_local_id: localId,
  } as never);

  if (error) {
    throw new Error("Não foi possível salvar o animal: " + error.message);
  }

  redirect(`/cadastro?token=${token}&etapa=2`);
}
