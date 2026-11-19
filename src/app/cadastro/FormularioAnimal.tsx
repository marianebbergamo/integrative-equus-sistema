"use client";

import { useState } from "react";
import { Select, TextField } from "@/components/ui";
import { enviarAnimal } from "./actions";

interface Local {
  id: string;
  nome: string;
  cidade: string | null;
}

interface FormularioAnimalProps {
  token: string;
  locais: Local[];
}

export function FormularioAnimal({ token, locais }: FormularioAnimalProps) {
  const [ondeFica, setOndeFica] = useState<"proprio" | "local">("proprio");
  const enviarComToken = enviarAnimal.bind(null, token);

  return (
    <form action={enviarComToken} className="flex flex-col gap-4">
      <TextField name="nome" label="Nome do animal" required />
      <div className="grid grid-cols-2 gap-3">
        <TextField name="raca" label="Raça" />
        <Select name="sexo" label="Sexo" defaultValue="">
          <option value="">Selecione</option>
          <option value="femea">Égua</option>
          <option value="macho">Macho</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField name="nascimento" label="Nascimento" type="date" />
        <TextField name="pelagem" label="Pelagem" />
      </div>
      <TextField name="registro" label="Número do registro" />
      <TextField name="associacao" label="Associação (ABQM, ABCCC...)" />

      <fieldset className="mt-1 flex flex-col gap-2.5 border-t border-borda pt-4">
        <legend className="mb-1 text-[16px] font-bold">Onde o animal fica?</legend>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-[#cfc8bf] bg-superficie px-3.5 text-[15px]">
          <input
            type="radio"
            name="onde_fica"
            value="proprio"
            checked={ondeFica === "proprio"}
            onChange={() => setOndeFica("proprio")}
            className="h-5 w-5 accent-bordo"
          />
          No meu endereço
        </label>
        <label
          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3.5 text-[15px] ${
            ondeFica === "local" ? "border-bordo font-semibold" : "border-[#cfc8bf]"
          }`}
        >
          <input
            type="radio"
            name="onde_fica"
            value="local"
            checked={ondeFica === "local"}
            onChange={() => setOndeFica("local")}
            className="h-5 w-5 accent-bordo"
          />
          Em um haras, fazenda ou CT
        </label>
        {ondeFica === "local" && (
          <Select name="local_id" label="Qual?">
            <option value="">Selecione</option>
            {locais.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
                {l.cidade && ` · ${l.cidade}`}
              </option>
            ))}
          </Select>
        )}
      </fieldset>

      <button
        type="submit"
        className="mt-2 flex min-h-13 items-center justify-center rounded-lg bg-bordo text-[17px] font-semibold text-white"
      >
        Adicionar animal
      </button>
    </form>
  );
}
