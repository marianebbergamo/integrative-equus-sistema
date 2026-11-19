"use client";

import { useMemo, useState } from "react";
import { Button, Select } from "@/components/ui";
import { criarAtendimento } from "../actions";

interface Animal {
  id: string;
  nome: string;
  raca: string | null;
  sexo: string | null;
  cliente_id: string;
  local_nome: string | null;
}

interface NovaPropostaFormProps {
  clientes: { id: string; nome: string }[];
  animais: Animal[];
}

export function NovaPropostaForm({ clientes, animais }: NovaPropostaFormProps) {
  const [clienteId, setClienteId] = useState("");

  const animaisDoCliente = useMemo(
    () => animais.filter((a) => a.cliente_id === clienteId),
    [animais, clienteId],
  );

  return (
    <form action={criarAtendimento} className="flex flex-col gap-4">
      <Select
        name="cliente_id"
        label="Cliente"
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
        required
      >
        <option value="">Selecione</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </Select>

      <Select name="animal_id" label="Animal" defaultValue="" disabled={!clienteId}>
        <option value="">Selecione (opcional)</option>
        {animaisDoCliente.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
            {a.raca && ` · ${a.raca}`}
            {a.local_nome && ` · ${a.local_nome}`}
          </option>
        ))}
      </Select>

      <div className="mt-2 flex justify-end gap-3">
        <Button type="submit" disabled={!clienteId}>
          Continuar
        </Button>
      </div>
    </form>
  );
}
