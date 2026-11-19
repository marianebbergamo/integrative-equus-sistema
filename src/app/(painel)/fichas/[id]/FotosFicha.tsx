"use client";

import { useRef } from "react";
import { anexarFotoFicha } from "../actions";

interface FotosFichaProps {
  fichaId: string;
  atendimentoId: string;
  fotos: { id: string; url: string }[];
}

export function FotosFicha({ fichaId, atendimentoId, fotos }: FotosFichaProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const anexarComIds = anexarFotoFicha.bind(null, fichaId, atendimentoId);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-bold">Fotos e vídeos</div>
      <div className="grid grid-cols-4 gap-2">
        {fotos.map((foto) => (
          <img
            key={foto.id}
            src={foto.url}
            alt="Foto anexada"
            className="aspect-square rounded-lg bg-[#ddd6cc] object-cover"
          />
        ))}
        <form
          ref={formRef}
          action={anexarComIds}
          onChange={() => formRef.current?.requestSubmit()}
        >
          <label
            aria-label="Adicionar foto ou vídeo"
            className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-bordo text-[26px] text-bordo"
          >
            +
            <input type="file" name="arquivo" accept="image/*,video/*" className="hidden" />
          </label>
        </form>
      </div>
    </div>
  );
}
