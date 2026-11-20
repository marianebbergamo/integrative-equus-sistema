export const CATEGORIAS_SERVICO = [
  "Fisioterapia e Reabilitação",
  "Clínica Ortopédica",
  "Clínica Cirúrgica",
  "Diagnóstico por Imagem",
  "Odontologia Equina",
  "Terapias Ortobiológicas",
  "Nutrição e Endocrinologia",
  "Clínica geral",
];

export const CLASSES_PRODUTO = [
  "Sedativo",
  "Anti-inflamatório",
  "Antibiótico",
  "Anestésico",
  "Material de curativo",
  "Descartável",
  "Suplemento",
];

// A categoria do produto é derivada da classe, para alimentar os filtros
// da tela de Produtos (Medicamentos, Materiais, Descartáveis).
export const CATEGORIA_POR_CLASSE: Record<string, string> = {
  Sedativo: "Medicamento",
  "Anti-inflamatório": "Medicamento",
  Antibiótico: "Medicamento",
  Anestésico: "Medicamento",
  Suplemento: "Medicamento",
  "Material de curativo": "Material",
  Descartável: "Descartável",
};

export const UNIDADES_COBRANCA_SERVICO: Record<string, string> = {
  sessao: "por sessão",
  atendimento: "por atendimento",
  animal: "por animal",
  pacote: "por pacote",
  hora: "por hora",
  projecao: "por projeção",
  aplicacao: "por aplicação",
  quilometro: "por quilômetro",
};

export const UNIDADES_USO_PRODUTO: Record<string, string> = {
  ml: "ml",
  mg: "mg",
  dose: "dose",
  unidade: "unidade",
  frasco: "frasco",
  comprimido: "comprimido",
  caixa: "caixa",
  metro: "metro",
  kg: "kg",
  grama: "grama",
};
