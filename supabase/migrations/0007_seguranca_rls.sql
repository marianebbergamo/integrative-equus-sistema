create function usuario_atual_ativo() returns boolean as $$
  select exists (
    select 1 from usuarios where id = auth.uid() and ativo
  );
$$ language sql security definer stable set search_path = public;

create function usuario_atual_perfil() returns perfil_usuario as $$
  select perfil from usuarios where id = auth.uid() and ativo;
$$ language sql security definer stable set search_path = public;

-- Tabelas de acesso geral: qualquer usuário logado e ativo lê e escreve.
do $$
declare
  tabela text;
begin
  for tabela in select unnest(array[
    'usuarios', 'regioes', 'locais', 'clientes', 'animais', 'animal_arquivos',
    'servicos', 'produtos',
    'atendimentos', 'atendimento_itens', 'atendimento_historico',
    'rotas', 'rota_veterinarios', 'rota_paradas',
    'ficha_modelos', 'fichas', 'ficha_arquivos',
    'cobrancas', 'notas_fiscais',
    'estoque_lotes', 'estoque_movimentacoes', 'configuracoes_empresa',
    'retornos', 'convites_cadastro'
  ])
  loop
    execute format('alter table %I enable row level security', tabela);
    execute format(
      'create policy usuarios_ativos_leem on %I for select using (usuario_atual_ativo())',
      tabela
    );
    execute format(
      'create policy usuarios_ativos_escrevem on %I for insert with check (usuario_atual_ativo())',
      tabela
    );
    execute format(
      'create policy usuarios_ativos_atualizam on %I for update using (usuario_atual_ativo())',
      tabela
    );
    execute format(
      'create policy usuarios_ativos_excluem on %I for delete using (usuario_atual_ativo())',
      tabela
    );
  end loop;
end;
$$;

-- O perfil financeiro não altera fichas; o perfil veterinário não altera cobranças.
drop policy usuarios_ativos_escrevem on fichas;
drop policy usuarios_ativos_atualizam on fichas;
drop policy usuarios_ativos_excluem on fichas;

create policy nao_financeiro_insere_fichas on fichas
  for insert with check (usuario_atual_ativo() and usuario_atual_perfil() <> 'financeiro');
create policy nao_financeiro_atualiza_fichas on fichas
  for update using (usuario_atual_ativo() and usuario_atual_perfil() <> 'financeiro');
create policy nao_financeiro_exclui_fichas on fichas
  for delete using (usuario_atual_ativo() and usuario_atual_perfil() <> 'financeiro');

drop policy usuarios_ativos_escrevem on cobrancas;
drop policy usuarios_ativos_atualizam on cobrancas;
drop policy usuarios_ativos_excluem on cobrancas;

create policy nao_veterinario_insere_cobrancas on cobrancas
  for insert with check (usuario_atual_ativo() and usuario_atual_perfil() <> 'veterinario');
create policy nao_veterinario_atualiza_cobrancas on cobrancas
  for update using (usuario_atual_ativo() and usuario_atual_perfil() <> 'veterinario');
create policy nao_veterinario_exclui_cobrancas on cobrancas
  for delete using (usuario_atual_ativo() and usuario_atual_perfil() <> 'veterinario');

drop policy usuarios_ativos_escrevem on notas_fiscais;
drop policy usuarios_ativos_atualizam on notas_fiscais;
drop policy usuarios_ativos_excluem on notas_fiscais;

create policy nao_veterinario_insere_notas_fiscais on notas_fiscais
  for insert with check (usuario_atual_ativo() and usuario_atual_perfil() <> 'veterinario');
create policy nao_veterinario_atualiza_notas_fiscais on notas_fiscais
  for update using (usuario_atual_ativo() and usuario_atual_perfil() <> 'veterinario');
create policy nao_veterinario_exclui_notas_fiscais on notas_fiscais
  for delete using (usuario_atual_ativo() and usuario_atual_perfil() <> 'veterinario');

-- Ninguém insere diretamente em atendimento_historico; só o gatilho grava, como dono da função.
drop policy usuarios_ativos_escrevem on atendimento_historico;
drop policy usuarios_ativos_atualizam on atendimento_historico;
drop policy usuarios_ativos_excluem on atendimento_historico;

-- Só administrador cria, altera ou desativa usuários.
drop policy usuarios_ativos_escrevem on usuarios;
drop policy usuarios_ativos_atualizam on usuarios;
drop policy usuarios_ativos_excluem on usuarios;

create policy administrador_insere_usuarios on usuarios
  for insert with check (usuario_atual_ativo() and usuario_atual_perfil() = 'administrador');
create policy administrador_atualiza_usuarios on usuarios
  for update using (usuario_atual_ativo() and usuario_atual_perfil() = 'administrador');
create policy administrador_exclui_usuarios on usuarios
  for delete using (usuario_atual_ativo() and usuario_atual_perfil() = 'administrador');

-- Convite de cadastro: o visitante nunca lê a tabela, só chama as funções
-- de cadastro público (security definer), que ignoram RLS e validam o token
-- por dentro. As policies acima (usuarios_ativos_*) valem para a equipe,
-- que cria e acompanha os convites pela tela de Clientes.

-- clientes_cadastro_status é uma view: herda RLS de clientes automaticamente.
