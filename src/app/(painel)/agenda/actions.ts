"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function criarRota(regiaoId: string | null, formData: FormData) {
  const supabase = await createClient();

  const data = String(formData.get("data") ?? "");
  if (!data) {
    throw new Error("Escolha a data da rota.");
  }

  const atendimentoIds = formData.getAll("atendimento_id").map(String);
  const selecionados = atendimentoIds.filter(
    (id) => formData.get(`incluir_${id}`) === "on",
  );

  if (selecionados.length === 0) {
    throw new Error("Selecione ao menos um atendimento para a rota.");
  }

  const { data: empresa } = await supabase
    .from("configuracoes_empresa")
    .select("endereco_partida_rotas")
    .single();

  const { data: rota, error: erroRota } = await supabase
    .from("rotas")
    .insert({
      data,
      regiao_id: regiaoId,
      ponto_partida: empresa?.endereco_partida_rotas ?? null,
    })
    .select("id")
    .single();

  if (erroRota) {
    throw new Error("Não foi possível criar a rota: " + erroRota.message);
  }

  const veterinariosNaRota = new Set<string>();

  for (let i = 0; i < selecionados.length; i++) {
    const atendimentoId = selecionados[i];
    const horario = String(formData.get(`horario_${atendimentoId}`) ?? "") || null;
    const ordem = Number(formData.get(`ordem_${atendimentoId}`) ?? i + 1);

    const { error: erroParada } = await supabase.from("rota_paradas").insert({
      rota_id: rota.id,
      atendimento_id: atendimentoId,
      ordem,
      horario_previsto: horario,
    });
    if (erroParada) {
      throw new Error("Não foi possível adicionar a parada: " + erroParada.message);
    }

    const dataHora = horario ? `${data}T${horario}:00` : `${data}T00:00:00`;
    const { data: atendimentoAtualizado, error: erroAtendimento } = await supabase
      .from("atendimentos")
      .update({ etapa: "agendado", data_agendamento: dataHora })
      .eq("id", atendimentoId)
      .select("veterinario_id")
      .single();

    if (erroAtendimento) {
      throw new Error("Não foi possível agendar o atendimento: " + erroAtendimento.message);
    }
    if (atendimentoAtualizado?.veterinario_id) {
      veterinariosNaRota.add(atendimentoAtualizado.veterinario_id);
    }
  }

  if (veterinariosNaRota.size > 0) {
    await supabase
      .from("rota_veterinarios")
      .insert([...veterinariosNaRota].map((usuario_id) => ({ rota_id: rota.id, usuario_id })));
  }

  revalidatePath("/fluxo");
  revalidatePath("/agenda");
  redirect("/agenda");
}
