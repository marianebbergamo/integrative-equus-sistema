import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, PageHeader } from "@/components/ui";
import { linkRotaGoogleMaps } from "@/lib/googleMaps";

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function segundaFeiraDe(data: Date) {
  const copia = new Date(data);
  const diaSemana = copia.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  copia.setDate(copia.getDate() + diff);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function formatarDataIso(data: Date) {
  return data.toISOString().slice(0, 10);
}

function formatarDataCurta(data: Date) {
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function tempoDecorrido(data: string) {
  const dias = Math.floor((Date.now() - new Date(data).getTime()) / (24 * 60 * 60 * 1000));
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  return `há ${dias} dias`;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const { semana } = await searchParams;
  const supabase = await createClient();

  const segunda = segundaFeiraDe(semana ? new Date(semana + "T00:00:00") : new Date());
  const sabado = new Date(segunda);
  sabado.setDate(sabado.getDate() + 5);
  const semanaAnterior = new Date(segunda);
  semanaAnterior.setDate(semanaAnterior.getDate() - 7);
  const semanaSeguinte = new Date(segunda);
  semanaSeguinte.setDate(semanaSeguinte.getDate() + 7);

  const [{ data: espera }, { data: rotas }] = await Promise.all([
    supabase
      .from("atendimentos")
      .select(
        "id, data_aprovacao, clientes(nome), locais(regiao_id, regioes(nome)), atendimento_itens(servicos(nome), animais(nome))",
      )
      .eq("etapa", "a_agendar")
      .order("data_aprovacao"),
    supabase
      .from("rotas")
      .select(
        "id, data, ponto_partida, regioes(nome), rota_paradas(ordem, horario_previsto, atendimentos(id, clientes(nome), veterinario_id, usuarios(nome), locais(nome, cidade, logradouro, numero, uf, latitude, longitude), atendimento_itens(servicos(nome))))",
      )
      .gte("data", formatarDataIso(segunda))
      .lte("data", formatarDataIso(sabado))
      .order("data"),
  ]);

  type ItemEspera = NonNullable<typeof espera>[number];
  const esperaPorRegiao = new Map<string, { regiao: string; itens: ItemEspera[] }>();
  for (const item of espera ?? []) {
    const chave = item.locais?.regiao_id ?? "sem-regiao";
    const nome = item.locais?.regioes?.nome ?? "Sem região";
    if (!esperaPorRegiao.has(chave)) {
      esperaPorRegiao.set(chave, { regiao: nome, itens: [] });
    }
    esperaPorRegiao.get(chave)!.itens.push(item);
  }

  const diasDaSemana = Array.from({ length: 6 }, (_, i) => {
    const data = new Date(segunda);
    data.setDate(data.getDate() + i);
    return data;
  });

  const rotaPorData = new Map((rotas ?? []).map((r) => [r.data, r]));

  return (
    <>
      <PageHeader
        titulo="Agenda e rotas"
        descricao={`Semana de ${formatarDataCurta(segunda)} a ${formatarDataCurta(sabado)}`}
        acoes={
          <>
            <Link href={`/agenda?semana=${formatarDataIso(semanaAnterior)}`}>
              <Button variante="secundario" aria-label="Semana anterior">
                ‹
              </Button>
            </Link>
            <Link href="/agenda">
              <Button variante="secundario">Esta semana</Button>
            </Link>
            <Link href={`/agenda?semana=${formatarDataIso(semanaSeguinte)}`}>
              <Button variante="secundario" aria-label="Próxima semana">
                ›
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-start gap-5">
        <aside className="flex min-w-0 flex-[1_1_290px] flex-col gap-4 rounded-xl border border-borda bg-superficie p-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-titulo text-[22px] font-normal">Lista de espera</h2>
            <p className="text-sm text-texto-secundario">
              {espera?.length ?? 0} propostas aprovadas, agrupadas por região
            </p>
          </div>
          {[...esperaPorRegiao.entries()].map(([chave, grupo]) => (
            <div key={chave} className="flex flex-col gap-2 border-t border-[#eee8e0] pt-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-bold">{grupo.regiao}</span>
                <span className="text-[13px] text-texto-secundario">
                  {grupo.itens!.length} atendimento{grupo.itens!.length > 1 ? "s" : ""}
                </span>
              </div>
              {grupo.itens!.map((item) => {
                const servicos = Array.from(
                  new Set(
                    item.atendimento_itens
                      ?.map((i) => i.servicos?.nome)
                      .filter((n): n is string => Boolean(n)),
                  ),
                ).join(", ");
                return (
                  <div key={item.id} className="flex flex-col gap-0.5 rounded-lg bg-fundo px-3 py-2.5">
                    <span className="text-sm font-semibold">{item.clientes?.nome}</span>
                    <span className="text-[13px] text-[#4A4546]">
                      {servicos || "sem itens"} ·{" "}
                      {item.data_aprovacao ? tempoDecorrido(item.data_aprovacao) : "—"}
                    </span>
                  </div>
                );
              })}
              <Link
                href={`/agenda/rotas/novo${chave !== "sem-regiao" ? `?regiaoId=${chave}` : ""}`}
              >
                <Button variante="secundario" className="w-full">
                  Montar rota
                </Button>
              </Link>
            </div>
          ))}
          {(espera ?? []).length === 0 && (
            <p className="text-sm text-texto-secundario">
              Nenhuma proposta aprovada aguardando agendamento.
            </p>
          )}
        </aside>

        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <section className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] items-start gap-2.5">
            {diasDaSemana.map((dia, indice) => {
              const rota = rotaPorData.get(formatarDataIso(dia));
              const paradas = (rota?.rota_paradas ?? []).sort((a, b) => a.ordem - b.ordem);
              return (
                <div
                  key={indice}
                  className="box-border flex min-h-[250px] flex-col gap-2 rounded-xl border border-borda bg-superficie p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="font-titulo text-xl text-bordo">
                      {DIAS_SEMANA[indice].slice(0, 3)} {dia.getDate()}
                    </div>
                    <div className="text-[13px] font-bold">
                      {rota?.regioes?.nome ?? "Dia livre"}
                    </div>
                    <div className="text-xs text-texto-secundario">
                      {paradas.length > 0 ? `${paradas.length} paradas` : "Sem atendimentos"}
                    </div>
                  </div>
                  {paradas.map((p, i) => (
                    <div key={i} className="flex flex-col gap-px rounded-lg bg-fundo px-2.5 py-2">
                      <div className="text-xs font-bold text-bordo">
                        {p.horario_previsto?.slice(0, 5) ?? "—"} ·{" "}
                        {p.atendimentos?.usuarios?.nome ?? "—"}
                      </div>
                      <div className="text-[13px] leading-[1.25] font-semibold">
                        {p.atendimentos?.clientes?.nome}
                      </div>
                      <div className="text-xs text-texto-secundario">
                        {p.atendimentos?.locais?.cidade ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </section>

          {(rotas ?? []).map((rota) => {
            const paradas = [...(rota.rota_paradas ?? [])].sort((a, b) => a.ordem - b.ordem);
            const link = linkRotaGoogleMaps(
              rota.ponto_partida,
              paradas.map((p) => ({
                latitude: p.atendimentos?.locais?.latitude,
                longitude: p.atendimentos?.locais?.longitude,
                logradouro: p.atendimentos?.locais?.logradouro,
                numero: p.atendimentos?.locais?.numero,
                cidade: p.atendimentos?.locais?.cidade,
                uf: p.atendimentos?.locais?.uf,
              })),
            );
            const dataFormatada = new Date(rota.data + "T00:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            });

            return (
              <section
                key={rota.id}
                className="flex flex-col gap-4 rounded-xl border border-borda bg-superficie p-5.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-titulo text-[22px] font-normal">
                      Rota de {dataFormatada} · {rota.regioes?.nome ?? "Sem região"}
                    </h2>
                    <p className="text-sm text-texto-secundario">
                      {paradas.length} paradas
                      {rota.ponto_partida && ` · saída e retorno em ${rota.ponto_partida}`}
                    </p>
                  </div>
                  {link && (
                    <a href={link} target="_blank" rel="noreferrer">
                      <Button variante="secundario">Abrir no Google Maps</Button>
                    </a>
                  )}
                </div>

                <ol className="m-0 flex list-none flex-col p-0">
                  {paradas.map((p, indice) => (
                    <li
                      key={indice}
                      className="flex items-start gap-3.5 border-t border-[#eee8e0] py-3 first:border-t-0"
                    >
                      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-bordo text-[13px] font-bold text-white">
                        {indice + 1}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="text-[15px] font-semibold">
                          {p.horario_previsto?.slice(0, 5) ?? "—"} · {p.atendimentos?.clientes?.nome}
                        </div>
                        <div className="text-[13px] text-[#4A4546]">
                          {p.atendimentos?.locais?.cidade ?? "—"} ·{" "}
                          {Array.from(
                            new Set(
                              p.atendimentos?.atendimento_itens
                                ?.map((i) => i.servicos?.nome)
                                .filter((n): n is string => Boolean(n)),
                            ),
                          ).join(", ") || "sem itens"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
