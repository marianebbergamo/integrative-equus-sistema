import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, TextField } from "@/components/ui";
import { CamposEndereco } from "@/components/forms/CamposEndereco";
import { CadastroLayout } from "./CadastroLayout";
import { FormularioAnimal } from "./FormularioAnimal";
import { enviarDadosCliente } from "./actions";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; etapa?: string }>;
}) {
  const { token, etapa } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fundo p-6 text-center">
        <p className="text-texto-secundario">
          Este link de cadastro é pessoal. Peça à Fabi ou ao Bruno um novo link.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: convites } = await supabase.rpc("validar_convite_cadastro", {
    p_token: token,
  });
  const convite = convites?.[0];

  if (!convite || !convite.valido) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fundo p-6 text-center">
        <p className="text-texto-secundario">
          Este link de cadastro expirou ou já foi usado. Peça à Fabi ou ao Bruno
          um novo link.
        </p>
      </div>
    );
  }

  if (etapa === "2") {
    if (!convite.cliente_id) {
      // ainda não preencheu a etapa 1 nesta sessão
      return (
        <CadastroLayout
          etapaAtual={1}
          titulo="Seus dados"
          subtitulo="Leva uns 3 minutos. Com isso, a Fabi e o Bruno já chegam sabendo quem você é e onde está o seu cavalo."
        >
          <FormularioDados token={token} />
        </CadastroLayout>
      );
    }

    const [{ data: locais }, { data: animais }] = await Promise.all([
      supabase.rpc("listar_locais_cadastro", { p_busca: "" }),
      supabase.rpc("listar_animais_por_convite", { p_token: token }),
    ]);

    return (
      <CadastroLayout etapaAtual={2} titulo="Seus animais">
        {(animais ?? []).length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-borda bg-superficie p-4">
            <h2 className="text-sm font-bold">Já adicionados</h2>
            {animais!.map((a) => (
              <div key={a.id} className="text-sm">
                {a.nome}
              </div>
            ))}
          </div>
        )}

        <FormularioAnimal token={token} locais={locais ?? []} />

        <Link
          href={`/cadastro/concluido`}
          className="mt-2 flex min-h-13 items-center justify-center rounded-lg border border-bordo text-[16px] font-semibold text-bordo"
        >
          Conferir e enviar
        </Link>
      </CadastroLayout>
    );
  }

  return (
    <CadastroLayout
      etapaAtual={1}
      titulo="Seus dados"
      subtitulo="Leva uns 3 minutos. Com isso, a Fabi e o Bruno já chegam sabendo quem você é e onde está o seu cavalo."
    >
      <FormularioDados token={token} />
    </CadastroLayout>
  );
}

function FormularioDados({ token }: { token: string }) {
  const enviarComToken = enviarDadosCliente.bind(null, token);

  return (
    <form action={enviarComToken} className="flex flex-col gap-4">
      <TextField name="nome" label="Nome completo" required />
      <TextField name="documento" label="CPF" placeholder="000.000.000-00" />
      <TextField
        name="telefone"
        label="Telefone com WhatsApp"
        placeholder="(47) 90000-0000"
      />
      <TextField name="email" label="E-mail" type="email" />

      <h2 className="mt-1 border-t border-borda pt-4 text-base font-bold">
        Seu endereço
      </h2>
      <CamposEndereco />

      <Button type="submit" className="mt-2 min-h-13 text-[17px]">
        Continuar para os animais
      </Button>
      <p className="text-center text-xs text-texto-secundario">
        Seus dados são usados só para o atendimento e a emissão da nota fiscal.
      </p>
    </form>
  );
}
