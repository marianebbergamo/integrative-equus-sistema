import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { FichaForm } from "./FichaForm";
import { FotosFicha } from "./FotosFicha";

export default async function FichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ animalId?: string }>;
}) {
  const { id } = await params;
  const { animalId: animalIdParam } = await searchParams;
  const supabase = await createClient();

  const { data: atendimento } = await supabase
    .from("atendimentos")
    .select("*, clientes(nome), locais(nome, cidade), usuarios(nome)")
    .eq("id", id)
    .single();

  if (!atendimento) notFound();

  const { data: itens } = await supabase
    .from("atendimento_itens")
    .select("id, animal_id, tipo, origem, realizado, servicos(nome), animais(nome)")
    .eq("atendimento_id", id);

  const animaisDoAtendimento = Array.from(
    new Map(
      (itens ?? [])
        .filter((i) => i.animal_id)
        .map((i) => [i.animal_id as string, i.animais?.nome ?? "Animal"]),
    ),
  );

  const animalId = animalIdParam ?? animaisDoAtendimento[0]?.[0];

  if (!animalId) {
    return (
      <>
        <PageHeader titulo="Ficha de atendimento" />
        <Card>
          <p className="text-texto-secundario">
            Nenhum animal associado a este atendimento ainda. Adicione itens na proposta
            indicando o animal antes de preencher a ficha.
          </p>
        </Card>
      </>
    );
  }

  const nomeAnimal = animaisDoAtendimento.find(([aid]) => aid === animalId)?.[1] ?? "Animal";

  const [{ data: tipos }, { data: ficha }] = await Promise.all([
    supabase.from("ficha_modelos").select("id, nome").eq("ativo", true).order("nome"),
    supabase
      .from("fichas")
      .select("*, ficha_arquivos(id, url)")
      .eq("atendimento_id", id)
      .eq("animal_id", animalId)
      .maybeSingle(),
  ]);

  const procedimentos = (itens ?? [])
    .filter((i) => i.animal_id === animalId && i.tipo === "servico")
    .map((i) => ({
      id: i.id,
      nome: i.servicos?.nome ?? "Serviço",
      origem: i.origem,
      realizado: i.realizado,
    }));

  let fotos: { id: string; url: string }[] = [];
  if (ficha?.ficha_arquivos && ficha.ficha_arquivos.length > 0) {
    const assinadas = await Promise.all(
      ficha.ficha_arquivos.map(async (f) => {
        const { data } = await supabase.storage
          .from("fichas")
          .createSignedUrl(f.url, 3600);
        return { id: f.id, url: data?.signedUrl ?? "" };
      }),
    );
    fotos = assinadas.filter((f) => f.url);
  }

  const respostas = (ficha?.respostas as { queixa?: string } | null) ?? {};

  return (
    <div className="mx-auto flex max-w-[480px] flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-xl bg-bordo p-5 text-white">
        <div className="text-xs tracking-[0.14em] text-[#D9DBDD] uppercase">
          Ficha de atendimento
          {atendimento.data_agendamento &&
            ` · ${new Date(atendimento.data_agendamento).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </div>
        <div className="font-titulo text-[26px] leading-[1.1]">{nomeAnimal}</div>
        <div className="text-sm text-[#F1E6E8]">
          {atendimento.clientes?.nome}
          {atendimento.locais?.nome && ` · ${atendimento.locais.nome}`}
          {atendimento.usuarios?.nome && ` · ${atendimento.usuarios.nome}`}
        </div>
      </div>

      {animaisDoAtendimento.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {animaisDoAtendimento.map(([aid, nome]) => (
            <Link
              key={aid}
              href={`/fichas/${id}?animalId=${aid}`}
              className={`flex h-11 items-center rounded-full border px-3.5 text-sm font-semibold ${
                aid === animalId
                  ? "border-texto bg-texto text-white"
                  : "border-[#cfc8bf] bg-superficie text-texto"
              }`}
            >
              {nome}
            </Link>
          ))}
        </div>
      )}

      <FichaForm
        atendimentoId={id}
        animalId={animalId}
        tipos={tipos ?? []}
        fichaModeloIdAtual={ficha?.ficha_modelo_id ?? null}
        queixaAtual={respostas.queixa ?? ""}
        procedimentos={procedimentos}
        orientacoesAtual={ficha?.orientacoes_tutor ?? ""}
        retornoDiasAtual={ficha?.retorno_sugerido_dias ?? null}
      />

      {ficha ? (
        <FotosFicha fichaId={ficha.id} atendimentoId={id} fotos={fotos} />
      ) : (
        <p className="text-sm text-texto-secundario">
          Salve a ficha pela primeira vez para poder anexar fotos e vídeos.
        </p>
      )}
    </div>
  );
}
