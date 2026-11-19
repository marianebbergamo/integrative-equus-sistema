create type perfil_usuario as enum ('administrador', 'veterinario', 'financeiro');

create type etapa_atendimento as enum (
  'orcamento_a_fazer',
  'aguardando_aprovacao',
  'a_agendar',
  'agendado',
  'registrar_atendimento',
  'a_cobrar',
  'aguardando_pagamento',
  'emitir_nota_fiscal',
  'concluido',
  'recusado',
  'cancelado'
);

create type origem_atendimento as enum ('proposta', 'direto');

create type origem_item_atendimento as enum ('proposta', 'extra');

create type tipo_item_atendimento as enum ('servico', 'produto', 'deslocamento');

create type tipo_local as enum ('haras', 'ct', 'fazenda', 'propriedade_cliente');

create type sexo_animal as enum ('macho', 'femea');

create type unidade_cobranca_servico as enum ('sessao', 'atendimento', 'animal', 'pacote', 'hora');

create type unidade_uso_produto as enum ('ml', 'mg', 'dose', 'unidade', 'frasco', 'comprimido');

create type forma_pagamento as enum ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'transferencia', 'boleto');

create type situacao_cobranca as enum ('a_vencer', 'vencida', 'paga', 'cancelada');

create type situacao_retorno as enum ('a_vencer', 'agendado', 'feito');

create type tipo_movimentacao_estoque as enum ('entrada', 'saida', 'ajuste');
