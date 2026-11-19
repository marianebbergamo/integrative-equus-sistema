interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
}

export function PageHeader({ titulo, descricao, acoes }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-titulo text-[36px] leading-[1.1] font-normal text-texto">
          {titulo}
        </h1>
        {descricao && (
          <p className="text-[15px] text-texto-secundario">{descricao}</p>
        )}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2.5">{acoes}</div>}
    </header>
  );
}
