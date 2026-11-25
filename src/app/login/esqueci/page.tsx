import Link from "next/link";
import { Button, TextField } from "@/components/ui";
import { pedirNovaSenha } from "../actions";

interface EsqueciPageProps {
  searchParams: Promise<{ enviado?: string; erro?: string }>;
}

export default async function EsqueciPage({ searchParams }: EsqueciPageProps) {
  const { enviado, erro } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-fundo p-6">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-borda bg-superficie p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-titulo text-[28px] text-bordo">
            Esqueci minha senha
          </span>
          <span className="text-sm text-texto-secundario">
            Enviamos um link para você criar uma senha nova.
          </span>
        </div>

        {enviado ? (
          <p className="text-sm text-texto">
            Se esse e-mail estiver cadastrado, o link chega em alguns minutos.
            Abra o link <strong>neste mesmo navegador</strong>. Confira também
            a caixa de spam.
          </p>
        ) : (
          <form action={pedirNovaSenha} className="flex flex-col gap-4">
            <TextField
              label="E-mail"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
            {erro === "limite" && (
              <p className="text-sm font-medium text-situacao-atraso-fg">
                Muitos pedidos seguidos. Espere uns minutos e tente de novo.
              </p>
            )}
            {erro === "link" && (
              <p className="text-sm font-medium text-situacao-atraso-fg">
                O link expirou ou foi aberto em outro navegador. Peça um novo.
              </p>
            )}
            <Button type="submit" className="mt-1 w-full">
              Enviar link
            </Button>
          </form>
        )}

        <Link
          href="/login"
          className="text-center text-sm text-bordo hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
