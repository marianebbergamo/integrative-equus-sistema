create table usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  perfil perfil_usuario not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table regioes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor_deslocamento_km numeric(10, 2) not null default 0,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table locais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo tipo_local not null,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  regiao_id uuid references regioes (id) on delete set null,
  responsavel_nome text,
  responsavel_telefone text,
  como_chegar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index locais_regiao_id_idx on locais (regiao_id);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text,
  telefone text,
  email text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  indicado_por text,
  veterinario_referencia_id uuid references usuarios (id) on delete set null,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clientes_veterinario_referencia_id_idx on clientes (veterinario_referencia_id);

create table animais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  raca text,
  sexo sexo_animal,
  pelagem text,
  nascimento date,
  registro text,
  associacao text,
  chip text,
  cliente_id uuid not null references clientes (id) on delete cascade,
  local_id uuid references locais (id) on delete set null,
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index animais_cliente_id_idx on animais (cliente_id);
create index animais_local_id_idx on animais (local_id);

create table animal_arquivos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animais (id) on delete cascade,
  tipo text not null,
  nome_arquivo text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index animal_arquivos_animal_id_idx on animal_arquivos (animal_id);

create table convites_cadastro (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  cliente_id uuid references clientes (id) on delete cascade,
  validade timestamptz not null,
  usado_em timestamptz,
  created_at timestamptz not null default now()
);

create index convites_cadastro_cliente_id_idx on convites_cadastro (cliente_id);
