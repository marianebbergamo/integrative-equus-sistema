"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type FormaPagamento = Database["public"]["Enums"]["forma_pagamento"];

export async function enviarCobranca(
  cobrancaId: string,
  atendimentoId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const formaPagamento = (String(formData.get("forma_pagamento") ?? "") || null) as
    | FormaPagamento
    | null;
  const parcelas = Number(formData.get("parcelas") ?? 1);
  const vencimento = String(formData.get("vencimento") ?? "") || null;

  const { error: erroCobranca } = await supabase
    .from("cobrancas")
    .update({ forma_pagamento: formaPagamento, parcelas, vencimento })
    .eq("id", cobrancaId);

  if (erroCobranca) {
    throw new Error("Não foi possível salvar a cobrança: " + erroCobranca.message);
  }

  const { error: erroAtendimento } = await supabase
    .from("atendimentos")
    .update({ etapa: "aguardando_pagamento", data_cobranca: new Date().toISOString() })
    .eq("id", atendimentoId);

  if (erroAtendimento) {
    throw new Error("Não foi possível avançar o atendimento: " + erroAtendimento.message);
  }

  revalidatePath("/financeiro");
  revalidatePath("/fluxo");
  redirect("/financeiro");
}

export async function confirmarRecebimento(cobrancaId: string, atendimentoId: string) {
  const supabase = await createClient();
  const hoje = new Date().toISOString().slice(0, 10);

  const { error: erroCobranca } = await supabase
    .from("cobrancas")
    .update({ situacao: "paga", data_pagamento: hoje })
    .eq("id", cobrancaId);

  if (erroCobranca) {
    throw new Error("Não foi possível confirmar o recebimento: " + erroCobranca.message);
  }

  const { error: erroAtendimento } = await supabase
    .from("atendimentos")
    .update({ etapa: "emitir_nota_fiscal", data_pagamento: new Date().toISOString() })
    .eq("id", atendimentoId);

  if (erroAtendimento) {
    throw new Error("Não foi possível avançar o atendimento: " + erroAtendimento.message);
  }

  revalidatePath("/financeiro");
  revalidatePath("/fluxo");
}

export async function emitirNotaFiscal(
  cobrancaId: string,
  atendimentoId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const numero = String(formData.get("numero") ?? "") || null;
  const link = String(formData.get("link") ?? "") || null;

  const { error: erroNota } = await supabase.from("notas_fiscais").insert({
    cobranca_id: cobrancaId,
    numero,
    link,
    data_emissao: new Date().toISOString().slice(0, 10),
  });

  if (erroNota) {
    throw new Error("Não foi possível registrar a nota fiscal: " + erroNota.message);
  }

  const { error: erroAtendimento } = await supabase
    .from("atendimentos")
    .update({ etapa: "concluido", data_nota_fiscal: new Date().toISOString() })
    .eq("id", atendimentoId);

  if (erroAtendimento) {
    throw new Error("Não foi possível concluir o atendimento: " + erroAtendimento.message);
  }

  revalidatePath("/financeiro");
  revalidatePath("/fluxo");
  redirect("/financeiro");
}
