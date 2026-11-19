interface CadastroLayoutProps {
  etapaAtual: 1 | 2;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}

export function CadastroLayout({
  etapaAtual,
  titulo,
  subtitulo,
  children,
}: CadastroLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-fundo">
      <div className="flex items-center gap-3 bg-bordo p-5 text-white">
        <div className="flex flex-col gap-0.5">
          <span className="font-titulo text-[21px]">Integrative Equus</span>
          <span className="text-[11px] tracking-[0.18em] text-[#D9DBDD] uppercase">
            Medicina equina
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 pb-8">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-1.5" aria-hidden="true">
            <div
              className={`h-1.5 rounded-full ${etapaAtual >= 1 ? "bg-bordo" : "bg-[#DDD6CC]"}`}
            />
            <div
              className={`h-1.5 rounded-full ${etapaAtual >= 2 ? "bg-bordo" : "bg-[#DDD6CC]"}`}
            />
          </div>
          <span className="text-[13px] text-texto-secundario">
            Etapa {etapaAtual} de 2
          </span>
          <h1 className="font-titulo text-[28px] leading-[1.15] font-normal">
            {titulo}
          </h1>
          {subtitulo && <p className="text-[15px] text-[#4A4546]">{subtitulo}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
