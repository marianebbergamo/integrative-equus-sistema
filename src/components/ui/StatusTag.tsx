export type Situacao = "em-dia" | "atencao" | "atraso" | "informacao";

const ESTILOS: Record<Situacao, string> = {
  "em-dia": "bg-situacao-em-dia-bg text-situacao-em-dia-fg",
  atencao: "bg-situacao-atencao-bg text-situacao-atencao-fg",
  atraso: "bg-situacao-atraso-bg text-situacao-atraso-fg",
  informacao: "bg-situacao-informacao-bg text-situacao-informacao-fg",
};

interface StatusTagProps {
  situacao: Situacao;
  children: React.ReactNode;
}

export function StatusTag({ situacao, children }: StatusTagProps) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${ESTILOS[situacao]}`}
    >
      {children}
    </span>
  );
}
