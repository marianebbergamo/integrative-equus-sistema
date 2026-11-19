create sequence atendimentos_numero_seq;

create table atendimentos (
  id uuid primary key default gen_random_uuid(),
  numero int not null default nextval('atendimentos_numero_seq'),
  cliente_id uuid not null references clientes (id) on delete restrict,
  local_id uuid references locais (id) on delete set null,
  veterinario_id uuid references usuarios (id) on delete set null,
  etapa etapa_atendimento not null default 'orcamento_a_fazer',
  origem origem_atendimento not null default 'proposta',
  data_orcamento timestamptz,
  data_aprovacao timestamptz,
  data_agendamento timestamptz,
  data_atendimento timestamptz,
  data_fechamento timestamptz,
  data_cobranca timestamptz,
  data_pagamento timestamptz,
  data_nota_fiscal timestamptz,
  validade_proposta date,
  desconto numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  observacoes text,
  motivo_recusa text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (numero)
);

create index atendimentos_cliente_id_idx on atendimentos (cliente_id);
create index atendimentos_local_id_idx on atendimentos (local_id);
create index atendimentos_veterinario_id_idx on atendimentos (veterinario_id);
create index atendimentos_etapa_idx on atendimentos (etapa);

create table atendimento_itens (
  id uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references atendimentos (id) on delete cascade,
  animal_id uuid references animais (id) on delete set null,
  tipo tipo_item_atendimento not null,
  origem origem_item_atendimento not null default 'proposta',
  servico_id uuid references servicos (id) on delete set null,
  produto_id uuid references produtos (id) on delete set null,
  quantidade numeric(10, 2) not null default 1,
  valor_unitario numeric(10, 2) not null default 0,
  valor_total numeric(10, 2) generated always as (quantidade * valor_unitario) stored,
  realizado boolean not null default false,
  cobrar boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index atendimento_itens_atendimento_id_idx on atendimento_itens (atendimento_id);
create index atendimento_itens_animal_id_idx on atendimento_itens (animal_id);

create table atendimento_historico (
  id uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references atendimentos (id) on delete cascade,
  de_etapa etapa_atendimento,
  para_etapa etapa_atendimento not null,
  usuario_id uuid references usuarios (id) on delete set null,
  created_at timestamptz not null default now()
);

create index atendimento_historico_atendimento_id_idx on atendimento_historico (atendimento_id);

create table rotas (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  regiao_id uuid references regioes (id) on delete set null,
  ponto_partida text,
  km_previstos numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rotas_regiao_id_idx on rotas (regiao_id);
create index rotas_data_idx on rotas (data);

create table rota_veterinarios (
  rota_id uuid not null references rotas (id) on delete cascade,
  usuario_id uuid not null references usuarios (id) on delete cascade,
  primary key (rota_id, usuario_id)
);

create table rota_paradas (
  id uuid primary key default gen_random_uuid(),
  rota_id uuid not null references rotas (id) on delete cascade,
  atendimento_id uuid not null references atendimentos (id) on delete cascade,
  ordem int not null,
  horario_previsto time,
  duracao_minutos int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rota_id, atendimento_id)
);

create index rota_paradas_rota_id_idx on rota_paradas (rota_id);
create index rota_paradas_atendimento_id_idx on rota_paradas (atendimento_id);

create table ficha_modelos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  campos jsonb not null default '[]'::jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table fichas (
  id uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references atendimentos (id) on delete cascade,
  animal_id uuid not null references animais (id) on delete cascade,
  ficha_modelo_id uuid references ficha_modelos (id) on delete set null,
  veterinario_id uuid references usuarios (id) on delete set null,
  respostas jsonb not null default '{}'::jsonb,
  orientacoes_tutor text,
  retorno_sugerido_dias int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index fichas_atendimento_id_idx on fichas (atendimento_id);
create index fichas_animal_id_idx on fichas (animal_id);

create table ficha_arquivos (
  id uuid primary key default gen_random_uuid(),
  ficha_id uuid not null references fichas (id) on delete cascade,
  tipo text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index ficha_arquivos_ficha_id_idx on ficha_arquivos (ficha_id);

create table retornos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animais (id) on delete cascade,
  servico_id uuid references servicos (id) on delete set null,
  data_prevista date not null,
  situacao situacao_retorno not null default 'a_vencer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index retornos_animal_id_idx on retornos (animal_id);
create index retornos_data_prevista_idx on retornos (data_prevista);
