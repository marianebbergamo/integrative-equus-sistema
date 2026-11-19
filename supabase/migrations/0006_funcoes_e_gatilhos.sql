create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  tabela text;
begin
  for tabela in select unnest(array[
    'usuarios', 'regioes', 'locais', 'clientes', 'animais',
    'servicos', 'produtos',
    'atendimentos', 'atendimento_itens', 'rotas', 'rota_paradas',
    'ficha_modelos', 'fichas',
    'cobrancas', 'notas_fiscais', 'estoque_lotes', 'configuracoes_empresa',
    'retornos'
  ])
  loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute function set_updated_at()',
      tabela
    );
  end loop;
end;
$$;

-- Toda mudança de etapa do atendimento grava uma linha em atendimento_historico.
create function registrar_historico_atendimento() returns trigger as $$
begin
  if tg_op = 'INSERT' or new.etapa is distinct from old.etapa then
    insert into atendimento_historico (atendimento_id, de_etapa, para_etapa, usuario_id)
    values (new.id, case when tg_op = 'INSERT' then null else old.etapa end, new.etapa, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger registrar_historico_atendimento
  after insert or update on atendimentos
  for each row execute function registrar_historico_atendimento();

-- Os totais do atendimento são recalculados quando os itens mudam.
create function recalcular_totais_atendimento() returns trigger as $$
declare
  atendimento uuid;
begin
  atendimento = coalesce(new.atendimento_id, old.atendimento_id);

  update atendimentos
  set subtotal = coalesce((
        select sum(valor_total) from atendimento_itens
        where atendimento_id = atendimento and cobrar
      ), 0),
      total = coalesce((
        select sum(valor_total) from atendimento_itens
        where atendimento_id = atendimento and cobrar
      ), 0) - desconto
  where id = atendimento;

  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger recalcular_totais_atendimento
  after insert or update or delete on atendimento_itens
  for each row execute function recalcular_totais_atendimento();

-- O saldo de cada produto é a soma dos lotes; movimentações atualizam o lote.
create function aplicar_movimentacao_estoque() returns trigger as $$
begin
  if new.lote_id is null then
    raise exception 'Toda movimentação de estoque precisa de um lote.';
  end if;

  update estoque_lotes
  set quantidade = quantidade + case
    when new.tipo = 'entrada' then new.quantidade
    when new.tipo = 'saida' then -new.quantidade
    else new.quantidade
  end
  where id = new.lote_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger aplicar_movimentacao_estoque
  after insert on estoque_movimentacoes
  for each row execute function aplicar_movimentacao_estoque();

-- Diz, para cada cliente, se o cadastro está completo e o que falta.
create view clientes_cadastro_status as
select
  c.id as cliente_id,
  (c.documento is not null and c.documento <> '') as tem_documento,
  (c.telefone is not null and c.telefone <> '') as tem_telefone,
  (c.cep is not null and c.logradouro is not null and c.numero is not null and c.cidade is not null and c.uf is not null) as tem_endereco,
  exists (select 1 from animais a where a.cliente_id = c.id) as tem_animal,
  exists (
    select 1 from animais a where a.cliente_id = c.id and a.local_id is not null
  ) as tem_animal_com_local,
  (
    (c.documento is not null and c.documento <> '')
    and (c.telefone is not null and c.telefone <> '')
    and (c.cep is not null and c.logradouro is not null and c.numero is not null and c.cidade is not null and c.uf is not null)
    and exists (select 1 from animais a where a.cliente_id = c.id and a.local_id is not null)
  ) as cadastro_completo
from clientes c;
