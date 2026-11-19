"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { gerarConvite } from "./actions";

interface GerarLinkCadastroProps {
  clienteId?: string;
  rotulo?: string;
}

export function GerarLinkCadastro({
  clienteId,
  rotulo = "Enviar link de cadastro",
}: GerarLinkCadastroProps) {
  const [link, setLink] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [pendente, iniciar] = useTransition();

  function gerar() {
    iniciar(async () => {
      const token = await gerarConvite(clienteId ?? null);
      setLink(`${window.location.origin}/cadastro?token=${token}`);
      setCopiado(false);
    });
  }

  async function copiar() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
  }

  if (link) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <code className="max-w-[260px] truncate rounded-lg border border-borda bg-fundo px-3 py-2 text-sm">
          {link}
        </code>
        <Button type="button" variante="secundario" onClick={copiar}>
          {copiado ? "Copiado!" : "Copiar link"}
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" onClick={gerar} disabled={pendente}>
      {pendente ? "Gerando..." : rotulo}
    </Button>
  );
}
