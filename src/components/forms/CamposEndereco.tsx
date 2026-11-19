"use client";

import { useState } from "react";
import { TextField } from "@/components/ui";
import { buscarEnderecoPorCep } from "@/lib/viacep";

interface CamposEnderecoProps {
  defaultValues?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
}

export function CamposEndereco({ defaultValues = {} }: CamposEnderecoProps) {
  const [endereco, setEndereco] = useState({
    cep: defaultValues.cep ?? "",
    logradouro: defaultValues.logradouro ?? "",
    bairro: defaultValues.bairro ?? "",
    cidade: defaultValues.cidade ?? "",
    uf: defaultValues.uf ?? "",
  });
  const [mensagem, setMensagem] = useState("");

  async function aoSairDoCep() {
    setMensagem("Buscando endereço...");
    const resultado = await buscarEnderecoPorCep(endereco.cep);
    if (resultado) {
      setEndereco((atual) => ({ ...atual, ...resultado }));
      setMensagem("Endereço encontrado pelo CEP. Confira e complete o número.");
    } else {
      setMensagem("");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <TextField
        name="cep"
        label="CEP"
        inputMode="numeric"
        placeholder="00000-000"
        value={endereco.cep}
        onChange={(e) => setEndereco((a) => ({ ...a, cep: e.target.value }))}
        onBlur={aoSairDoCep}
      />
      {mensagem && (
        <div className="rounded-lg bg-situacao-em-dia-bg px-3 py-2 text-sm text-situacao-em-dia-fg">
          {mensagem}
        </div>
      )}
      <TextField
        name="logradouro"
        label="Rua"
        value={endereco.logradouro}
        onChange={(e) =>
          setEndereco((a) => ({ ...a, logradouro: e.target.value }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          name="numero"
          label="Número"
          defaultValue={defaultValues.numero}
        />
        <TextField
          name="complemento"
          label="Complemento"
          defaultValue={defaultValues.complemento}
        />
      </div>
      <div className="grid grid-cols-[1fr_90px] gap-3">
        <TextField
          name="bairro"
          label="Bairro"
          value={endereco.bairro}
          onChange={(e) =>
            setEndereco((a) => ({ ...a, bairro: e.target.value }))
          }
        />
        <TextField
          name="uf"
          label="UF"
          maxLength={2}
          value={endereco.uf}
          onChange={(e) =>
            setEndereco((a) => ({ ...a, uf: e.target.value.toUpperCase() }))
          }
        />
      </div>
      <TextField
        name="cidade"
        label="Cidade"
        value={endereco.cidade}
        onChange={(e) =>
          setEndereco((a) => ({ ...a, cidade: e.target.value }))
        }
      />
    </div>
  );
}
