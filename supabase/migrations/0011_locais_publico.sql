-- Usada pelo formulário público de cadastro (/cadastro) para o visitante
-- escolher o haras, fazenda ou CT onde o animal fica. Só nome e cidade,
-- nada sensível.
create function listar_locais_cadastro(p_busca text default '')
returns table (id uuid, nome text, cidade text) as $$
  select id, nome, cidade from locais
  where p_busca = '' or nome ilike '%' || p_busca || '%'
  order by nome
  limit 20;
$$ language sql security definer stable set search_path = public;

grant execute on function listar_locais_cadastro(text) to anon;
