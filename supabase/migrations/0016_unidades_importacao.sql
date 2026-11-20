-- Unidades que aparecem nos dados reais (planilha de exportação), ainda sem
-- correspondência nos enums.

alter type unidade_cobranca_servico add value 'quilometro';

alter type unidade_uso_produto add value 'kg';
alter type unidade_uso_produto add value 'grama';
