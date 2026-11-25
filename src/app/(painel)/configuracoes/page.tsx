import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { listarUsuarios } from "./actions";
import { UsuariosPainel } from "./UsuariosPainel";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const { data: eu } = await supabase
    .from("usuarios")
    .select("perfil")
    .eq("id", data.user!.id)
    .maybeSingle();

  if (eu?.perfil !== "administrador") {
    redirect("/");
  }

  const resultado = await listarUsuarios();

  return (
    <>
      <PageHeader titulo="Configurações" />
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-titulo text-2xl text-texto">Usuários e acessos</h2>
          <p className="text-[15px] text-texto-secundario">
            Quem entra no sistema e o que cada pessoa pode fazer.
          </p>
        </div>
        {resultado.ok ? (
          <UsuariosPainel usuarios={resultado.dados.usuarios} />
        ) : (
          <p className="text-sm font-medium text-situacao-atraso-fg">
            {resultado.erro}
          </p>
        )}
      </section>
    </>
  );
}
