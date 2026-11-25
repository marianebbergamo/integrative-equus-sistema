import Image from "next/image";
import Link from "next/link";
import { Button, TextField } from "@/components/ui";
import { entrar } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ erro?: string; proximo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { erro, proximo = "/" } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-fundo p-6">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-borda bg-superficie p-8">
        <div className="flex justify-center">
          <Image
            src="/marca/logo-vertical.png"
            alt="Integrative Equus — Medicina Equina"
            width={240}
            height={178}
            priority
          />
        </div>

        <form action={entrar} className="flex flex-col gap-4">
          <input type="hidden" name="proximo" value={proximo} />
          <TextField
            label="E-mail"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
          <TextField
            label="Senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            required
          />
          {erro === "credenciais" && (
            <p className="text-sm font-medium text-situacao-atraso-fg">
              E-mail ou senha incorretos.
            </p>
          )}
          <Button type="submit" className="mt-1 w-full">
            Entrar
          </Button>
          <Link
            href="/login/esqueci"
            className="text-center text-sm text-bordo hover:underline"
          >
            Esqueci minha senha
          </Link>
        </form>

        <p className="text-center text-xs text-texto-secundario">
          Uso interno. Os acessos são criados pelo administrador.
        </p>
      </div>
    </div>
  );
}
