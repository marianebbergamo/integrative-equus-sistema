export interface EnderecoViaCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export async function buscarEnderecoPorCep(
  cep: string,
): Promise<EnderecoViaCep | null> {
  const digitos = cep.replace(/\D/g, "");
  if (digitos.length !== 8) return null;

  const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  if (!resposta.ok) return null;

  const dados = await resposta.json();
  if (dados.erro) return null;

  return {
    logradouro: dados.logradouro ?? "",
    bairro: dados.bairro ?? "",
    cidade: dados.localidade ?? "",
    uf: dados.uf ?? "",
  };
}
