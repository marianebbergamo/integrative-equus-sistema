"use server";

import { cookies, headers } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
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
  const cookieStore = await cookies();

  // O pedido grava a chave PKCE em cookie antes de chamar o Supabase. Se o
  // pedido for recusado (ex.: limite de envio), essa chave nova não pode
  // substituir a do e-mail que já foi enviado, senão o link deixa de valer.
  const pendentes: { name: string; value: string; options: CookieOptions }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (lista) => {
          pendentes.push(...lista);
        },
      },
    },
  );
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origem}/auth/confirmar?proximo=/login/nova-senha`,
  });

  if (!error) {
    pendentes.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options),
    );
  }

  // Só o limite de envio é informado; outros erros não revelam se o e-mail existe.
  if (error?.status === 429) {
    redirect("/login/esqueci?erro=limite");
  }

  redirect("/login/esqueci?enviado=1");
}

export async function definirNovaSenha(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");
  const tokenHash = String(formData.get("token_hash") ?? "");
  const tipo = formData.get("tipo") === "invite" ? "invite" : "recovery";
  const manterLink = tokenHash
    ? `&token_hash=${encodeURIComponent(tokenHash)}&tipo=${tipo}`
    : "";

  if (senha.length < 8) {
    redirect(`/login/nova-senha?erro=curta${manterLink}`);
  }
  if (senha !== confirmacao) {
    redirect(`/login/nova-senha?erro=diferentes${manterLink}`);
  }

  const supabase = await createClient();

  if (tokenHash) {
    const { error: erroLink } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: tipo,
    });
    if (erroLink) {
      redirect("/login/esqueci?erro=link");
    }
  }

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
