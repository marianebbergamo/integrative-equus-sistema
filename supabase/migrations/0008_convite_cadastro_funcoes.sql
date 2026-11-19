-- Funções chamadas pelo link público de cadastro (/cadastro?token=...), sem
-- login. O visitante nunca lê tabelas: só chama estas funções, que validam o
-- convite por dentro e ignoram RLS (security definer).

create function validar_convite_cadastro(p_token uuid)
returns table (convite_id uuid, cliente_id uuid, valido boolean) as $$
  select id, convites_cadastro.cliente_id, (validade > now() and usado_em is null)
  from convites_cadastro
  where token = p_token;
$$ language sql security definer stable set search_path = public;

create function cadastrar_cliente_por_convite(
  p_token uuid,
  p_nome text,
  p_documento text,
  p_telefone text,
  p_email text,
  p_cep text,
  p_logradouro text,
  p_numero text,
  p_complemento text,
  p_bairro text,
  p_cidade text,
  p_uf text
) returns uuid as $$
declare
  v_convite convites_cadastro;
  v_cliente_id uuid;
begin
  select * into v_convite from convites_cadastro
  where token = p_token and validade > now() and usado_em is null;

  if v_convite is null then
    raise exception 'Convite inválido ou expirado.';
  end if;

  if v_convite.cliente_id is not null then
    update clientes set
      nome = p_nome, documento = p_documento, telefone = p_telefone, email = p_email,
      cep = p_cep, logradouro = p_logradouro, numero = p_numero, complemento = p_complemento,
      bairro = p_bairro, cidade = p_cidade, uf = p_uf
    where id = v_convite.cliente_id
    returning id into v_cliente_id;
  else
    insert into clientes (nome, documento, telefone, email, cep, logradouro, numero, complemento, bairro, cidade, uf)
    values (p_nome, p_documento, p_telefone, p_email, p_cep, p_logradouro, p_numero, p_complemento, p_bairro, p_cidade, p_uf)
    returning id into v_cliente_id;
  end if;

  update convites_cadastro set usado_em = now(), cliente_id = v_cliente_id where id = v_convite.id;

  return v_cliente_id;
end;
$$ language plpgsql security definer set search_path = public;

create function cadastrar_animal_por_convite(
  p_token uuid,
  p_nome text,
  p_raca text,
  p_sexo sexo_animal,
  p_pelagem text,
  p_nascimento date,
  p_registro text,
  p_associacao text,
  p_chip text,
  p_local_id uuid
) returns uuid as $$
declare
  v_cliente_id uuid;
  v_animal_id uuid;
begin
  select cliente_id into v_cliente_id from convites_cadastro
  where token = p_token and validade > now() and usado_em is not null;

  if v_cliente_id is null then
    raise exception 'Convite inválido, expirado ou ainda sem cliente cadastrado.';
  end if;

  insert into animais (nome, raca, sexo, pelagem, nascimento, registro, associacao, chip, cliente_id, local_id)
  values (p_nome, p_raca, p_sexo, p_pelagem, p_nascimento, p_registro, p_associacao, p_chip, v_cliente_id, p_local_id)
  returning id into v_animal_id;

  return v_animal_id;
end;
$$ language plpgsql security definer set search_path = public;

create function anexar_arquivo_animal_por_convite(
  p_token uuid,
  p_animal_id uuid,
  p_tipo text,
  p_nome_arquivo text,
  p_url text
) returns uuid as $$
declare
  v_cliente_id uuid;
  v_arquivo_id uuid;
begin
  select cliente_id into v_cliente_id from convites_cadastro
  where token = p_token and validade > now() and usado_em is not null;

  if v_cliente_id is null then
    raise exception 'Convite inválido ou expirado.';
  end if;

  if not exists (select 1 from animais where id = p_animal_id and cliente_id = v_cliente_id) then
    raise exception 'Animal não pertence a este convite.';
  end if;

  insert into animal_arquivos (animal_id, tipo, nome_arquivo, url)
  values (p_animal_id, p_tipo, p_nome_arquivo, p_url)
  returning id into v_arquivo_id;

  return v_arquivo_id;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function validar_convite_cadastro(uuid) to anon;
grant execute on function cadastrar_cliente_por_convite(uuid, text, text, text, text, text, text, text, text, text, text, text) to anon;
grant execute on function cadastrar_animal_por_convite(uuid, text, text, sexo_animal, text, date, text, text, text, uuid) to anon;
grant execute on function anexar_arquivo_animal_por_convite(uuid, uuid, text, text, text) to anon;
