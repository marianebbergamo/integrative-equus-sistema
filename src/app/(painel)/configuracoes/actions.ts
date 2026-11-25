"use server";

import { FunctionsHttpError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type Perfil = "administrador" | "veterinario" | "financeiro";

export interface UsuarioConfig {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  voce: boolean;
  pendente: boolean;
  ultimoAcesso: string | null;
}

type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };

async function chamar<T>(corpo: Record<string, unknown>): Promise<Resultado<T>> {
  const supabase = await createClient();
  const origem = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.functions.invoke("gerenciar-usuarios", {
    body: { ...corpo, origem },
  });

  if (error) {
    const corpoErro =
      error instanceof FunctionsHttpError
        ? await error.context.json().catch(() => null)
        : null;
    return { ok: false, erro: corpoErro?.erro ?? "Não foi possível falar com o servidor." };
  }
  return { ok: true, dados: data as T };
}

export async function listarUsuarios() {
  return chamar<{ usuarios: UsuarioConfig[] }>({ acao: "listar" });
}

export async function convidarUsuario(nome: string, email: string, perfil: Perfil) {
  const resultado = await chamar<{ link: string }>({ acao: "convidar", nome, email, perfil });
  revalidatePath("/configuracoes");
  return resultado;
}

export async function gerarLinkAcesso(usuarioId: string) {
  return chamar<{ link: string }>({ acao: "gerar_link", usuario_id: usuarioId });
}

export async function atualizarUsuario(
  usuarioId: string,
  mudancas: { perfil?: Perfil; ativo?: boolean },
) {
  const resultado = await chamar<{ ok: true }>({
    acao: "atualizar",
    usuario_id: usuarioId,
    ...mudancas,
  });
  revalidatePath("/configuracoes");
  return resultado;
}
