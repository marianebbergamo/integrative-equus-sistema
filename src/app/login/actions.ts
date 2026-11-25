"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function entrar(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");
  const proximo = String(formData.get("proximo") ?? "/");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    redirect(`/login?erro=credenciais&proximo=${encodeURIComponent(proximo)}`);
  }

  redirect(proximo || "/");
}

export async function pedirNovaSenha(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const origem = (await headers()).get("origin") ?? "";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origem}/auth/confirmar?proximo=/login/nova-senha`,
  });

  // Só o limite de envio é informado; outros erros não revelam se o e-mail existe.
  if (error?.status === 429) {
    redirect("/login/esqueci?erro=limite");
  }

  redirect("/login/esqueci?enviado=1");
}

export async function definirNovaSenha(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (senha.length < 8) {
    redirect("/login/nova-senha?erro=curta");
  }
  if (senha !== confirmacao) {
    redirect("/login/nova-senha?erro=diferentes");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) {
    redirect("/login/nova-senha?erro=falhou");
  }

  redirect("/");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
