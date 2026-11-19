-- Observação do fechamento para o financeiro, separada das observações
-- para o cliente (que entram no PDF da proposta).
alter table atendimentos add column observacoes_financeiro text;
