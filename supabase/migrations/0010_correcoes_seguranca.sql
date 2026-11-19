-- Correções apontadas pelo linter de segurança do Supabase depois da etapa 1.
alter view clientes_cadastro_status set (security_invoker = on);

alter function set_updated_at() set search_path = public;

-- Funções de gatilho não precisam ser chamáveis via API: só disparam sozinhas.
revoke execute on function registrar_historico_atendimento() from public, anon, authenticated;
revoke execute on function recalcular_totais_atendimento() from public, anon, authenticated;
revoke execute on function aplicar_movimentacao_estoque() from public, anon, authenticated;

-- usuario_atual_* só precisa ser chamada pelas próprias policies de RLS,
-- como o usuário autenticado; visitante (anon) não precisa.
revoke execute on function usuario_atual_ativo() from public;
revoke execute on function usuario_atual_perfil() from public;
grant execute on function usuario_atual_ativo() to authenticated;
grant execute on function usuario_atual_perfil() to authenticated;
