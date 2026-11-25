import { redirect } from "next/navigation";
import { Button, TextField } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { definirNovaSenha } from "../actions";

const MENSAGENS: Record<string, string> = {
  curta: "A senha precisa ter pelo menos 8 caracteres.",
  diferentes: "As duas senhas não são iguais.",
  falhou: "Não foi possível salvar. Tente outra senha.",
};

interface NovaSenhaPageProps {
  searchParams: Promise<{ erro?: string; token_hash?: string; tipo?: string }>;
}

export default async function NovaSenhaPage({
  searchParams,
}: NovaSenhaPageProps) {
  const { erro, token_hash: tokenHash, tipo } = await searchParams;
  const convite = tipo === "invite";

  let email: string | null = null;
  if (!tokenHash) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      redirect("/login/esqueci?erro=link");
    }
    email = data.user.email ?? null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fundo p-6">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-borda bg-superficie p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-titulo text-[28px] text-bordo">
            {convite ? "Crie sua senha" : "Nova senha"}
          </span>
          <span className="text-sm text-texto-secundario">
            {email ??
              (convite
                ? "Bem-vindo ao sistema da Integrative Equus."
                : "Escolha uma senha nova para entrar.")}
          </span>
        </div>

        <form action={definirNovaSenha} className="flex flex-col gap-4">
          {tokenHash && (
            <>
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="tipo" value={convite ? "invite" : "recovery"} />
            </>
          )}
          {email && (
            <input
              type="hidden"
              name="email"
              value={email}
              autoComplete="username"
            />
          )}
          <TextField
            label="Nova senha"
            name="senha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <TextField
            label="Repita a nova senha"
            name="confirmacao"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          {erro && MENSAGENS[erro] && (
            <p className="text-sm font-medium text-situacao-atraso-fg">
              {MENSAGENS[erro]}
            </p>
          )}
          <Button type="submit" className="mt-1 w-full">
            Salvar e entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
