import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, PageHeader, StatusTag } from "@/components/ui";
import { GerarLinkCadastro } from "../GerarLinkCadastro";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cliente) notFound();

  const { data: status } = await supabase
    .from("clientes_cadastro_status")
    .select("*")
    .eq("cliente_id", id)
    .single();

  const { data: animais } = await supabase
    .from("animais")
    .select("id, nome, raca, locais(nome, cidade)")
    .eq("cliente_id", id)
    .order("nome");

  const endereco = [
    cliente.logradouro,
    cliente.numero && `nº ${cliente.numero}`,
    cliente.complemento,
  ]
    .filter(Boolean)
    .join(", ");

  const faltando: string[] = [];
  if (status && !status.tem_documento) faltando.push("CPF/CNPJ");
  if (status && !status.tem_telefone) faltando.push("telefone");
  if (status && !status.tem_endereco) faltando.push("endereço");
  if (status && !status.tem_animal_com_local) faltando.push("animal com local");

  return (
    <>
      <PageHeader
        titulo={cliente.nome}
        descricao={[cliente.telefone, cliente.cidade].filter(Boolean).join(" · ")}
        acoes={
          <>
            <Link href={`/clientes/${id}/editar`}>
              <Button variante="secundario">Editar dados</Button>
            </Link>
            {!status?.cadastro_completo && (
              <GerarLinkCadastro clienteId={id} rotulo="Enviar link de cadastro" />
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-start gap-5">
        <Card className="flex min-w-0 flex-[999_1_520px] flex-col gap-3">
          <h2 className="font-titulo text-[22px] font-normal">Dados</h2>
          <dl className="flex flex-col gap-3 text-[15px]">
            <div>
              <dt className="text-[13px] text-texto-secundario">CPF/CNPJ</dt>
              <dd>{cliente.documento ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-texto-secundario">E-mail</dt>
              <dd>{cliente.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-texto-secundario">Endereço</dt>
              <dd>
                {endereco || "—"}
                <br />
                {[cliente.bairro, cliente.cidade, cliente.uf, cliente.cep]
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-texto-secundario">Indicado por</dt>
              <dd>{cliente.indicado_por ?? "—"}</dd>
            </div>
            {cliente.observacoes && (
              <div>
                <dt className="text-[13px] text-texto-secundario">Observações</dt>
                <dd>{cliente.observacoes}</dd>
              </div>
            )}
          </dl>

          <div className="mt-2 border-t border-borda pt-3">
            <StatusTag situacao={status?.cadastro_completo ? "em-dia" : "atencao"}>
              {status?.cadastro_completo ? "Cadastro completo" : "Cadastro incompleto"}
            </StatusTag>
            {faltando.length > 0 && (
              <p className="mt-2 text-sm text-texto-secundario">
                Falta: {faltando.join(", ")}.
              </p>
            )}
          </div>
        </Card>

        <Card className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Animais</h2>
            <Link
              href={`/animais/novo?clienteId=${id}`}
              className="text-sm font-semibold"
            >
              Adicionar
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {(animais ?? []).map((a) => (
              <Link
                key={a.id}
                href={`/animais/${a.id}`}
                className="flex justify-between gap-3 border-t border-[#eee8e0] pt-2 text-sm first:border-t-0 first:pt-0"
              >
                <span className="font-semibold">{a.nome}</span>
                <span className="text-texto-secundario">
                  {a.locais?.nome ?? "sem local definido"}
                </span>
              </Link>
            ))}
            {(animais ?? []).length === 0 && (
              <p className="text-sm text-texto-secundario">
                Nenhum animal cadastrado ainda.
              </p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
