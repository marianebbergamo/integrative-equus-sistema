create table cobrancas (
  id uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references atendimentos (id) on delete cascade,
  valor numeric(10, 2) not null default 0,
  forma_pagamento forma_pagamento,
  parcelas int not null default 1,
  vencimento date,
  situacao situacao_cobranca not null default 'a_vencer',
  data_pagamento date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cobrancas_atendimento_id_idx on cobrancas (atendimento_id);
create index cobrancas_situacao_idx on cobrancas (situacao);

create table notas_fiscais (
  id uuid primary key default gen_random_uuid(),
  cobranca_id uuid not null references cobrancas (id) on delete cascade,
  numero text,
  link text,
  data_emissao date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notas_fiscais_cobranca_id_idx on notas_fiscais (cobranca_id);

create table estoque_lotes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos (id) on delete cascade,
  lote text,
  validade date,
  quantidade numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index estoque_lotes_produto_id_idx on estoque_lotes (produto_id);

create table estoque_movimentacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos (id) on delete cascade,
  lote_id uuid references estoque_lotes (id) on delete set null,
  tipo tipo_movimentacao_estoque not null,
  quantidade numeric(10, 2) not null,
  motivo text,
  atendimento_id uuid references atendimentos (id) on delete set null,
  usuario_id uuid references usuarios (id) on delete set null,
  created_at timestamptz not null default now()
);

create index estoque_movimentacoes_produto_id_idx on estoque_movimentacoes (produto_id);
create index estoque_movimentacoes_lote_id_idx on estoque_movimentacoes (lote_id);

create table configuracoes_empresa (
  id boolean primary key default true,
  razao_social text,
  cnpj text,
  telefone text,
  email text,
  pix_chave text,
  texto_pdf_proposta text,
  endereco_partida_rotas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint configuracoes_empresa_linha_unica check (id)
);
