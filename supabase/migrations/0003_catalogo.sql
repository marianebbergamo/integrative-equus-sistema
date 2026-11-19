create table servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  unidade_cobranca unidade_cobranca_servico not null,
  valor numeric(10, 2) not null default 0,
  duracao_media_minutos int,
  retorno_dias int,
  tipo_ficha text,
  quem_realiza perfil_usuario,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table produtos (
  id uuid primary key default gen_random_uuid(),
  classe text not null,
  nome_comercial text not null,
  concentracao text,
  nome_completo text generated always as (
    trim(classe || ' ' || nome_comercial || coalesce(' ' || concentracao, ''))
  ) stored,
  fabricante text,
  categoria text,
  unidade_uso unidade_uso_produto not null,
  custo numeric(10, 2) not null default 0,
  preco_venda numeric(10, 2) not null default 0,
  estoque_minimo numeric(10, 2) not null default 0,
  cobrar_cliente_padrao boolean not null default true,
  controla_lote_validade boolean not null default true,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nome_completo)
);
