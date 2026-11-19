-- Usada pelo formulário público de cadastro (/cadastro) para mostrar os
-- animais que o próprio visitante já enviou neste convite.
create function listar_animais_por_convite(p_token uuid)
returns table (id uuid, nome text) as $$
  select a.id, a.nome
  from animais a
  join convites_cadastro c on c.cliente_id = a.cliente_id
  where c.token = p_token and c.usado_em is not null
  order by a.nome;
$$ language sql security definer stable set search_path = public;

grant execute on function listar_animais_por_convite(uuid) to anon;
