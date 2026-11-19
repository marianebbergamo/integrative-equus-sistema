-- Ajustes vindos das telas de referência 13-Servicos e 14-Produtos, só
-- disponíveis agora que chegamos nesta etapa.

alter type unidade_cobranca_servico add value 'projecao';
alter type unidade_cobranca_servico add value 'aplicacao';

alter type unidade_uso_produto add value 'caixa';
alter type unidade_uso_produto add value 'metro';
