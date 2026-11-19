# Novo sistema Integrative Equus: banco de dados, etapas e prompts

Versão de 19/11/2026. Base: as 15 telas aprovadas no canvas "Integrative Equus — Sistema de gestão (telas)".

## Decisões já tomadas

- O sistema antigo foi descartado. O projeto da Vercel `integrative-equus-gestao` foi excluído e o Supabase `Integrative-Equus-FB` está pausado, para ser excluído depois.
- O sistema novo nasce em repositório, projeto da Vercel e banco novos, sem reaproveitar código nem tabelas.
- Os dados que valem (232 clientes, 200 produtos, 17 serviços) estão na planilha `integrative-equus-exportacao-2026-11-19.xlsx` e entram no fim, já corrigidos.
- Uso interno por enquanto: Fabi, Bruno e financeiro. O cliente só acessa o link de cadastro, sem login.

## Tecnologia proposta

- **Aplicação:** Next.js (App Router) com TypeScript e Tailwind
- **Banco, login e arquivos:** Supabase (Postgres, Auth e Storage), região São Paulo
- **Hospedagem:** Vercel, com deploy automático a partir do GitHub
- **Endereço por CEP:** ViaCEP
- **Rotas e distâncias:** a definir (ver "Pontos em aberto")

## O conceito central: o atendimento é um cartão

No sistema antigo, orçamento, ordem de serviço e fatura eram registros separados. No novo existe um único registro, o **atendimento**, que muda de etapa:

| Nº | Etapa | Quem age | Ação que move o cartão |
|---|---|---|---|
| 1 | Orçamento a fazer | Fabi ou Bruno | Montar e enviar a proposta |
| 2 | Aguardando aprovação | Fabi ou Bruno | Registrar a resposta do cliente |
| 3 | A agendar | Fabi ou Bruno | Agendar em uma rota |
| 4 | Agendado | Veterinário | Atender no local |
| 5 | Registrar atendimento | Veterinário | Preencher a ficha e fechar |
| 6 | A cobrar | Financeiro | Enviar a cobrança |
| 7 | Aguardando pagamento | Financeiro | Confirmar o recebimento |
| 8 | Emitir nota fiscal | Financeiro | Emitir a NF |
| — | Concluído, recusado ou cancelado | — | Sai do quadro |

Atendimento direto (emergência ou cliente de confiança) nasce na etapa 5, sem proposta.

## Tabelas do banco novo

### Pessoas e lugares

- **usuarios:** nome, e-mail, perfil (administrador, veterinario, financeiro), ativo. Ligado ao login.
- **clientes:** nome, CPF ou CNPJ, telefone, e-mail, endereço completo, indicado_por, veterinario_referencia, observações. O sistema calcula sozinho se o cadastro está completo e o que falta.
- **regioes:** nome (ex.: Litoral Norte), valor do deslocamento, ordem de exibição.
- **locais:** nome, tipo (haras, CT, fazenda, propriedade do cliente), endereço, latitude e longitude, região, responsável no local, telefone, como chegar.
- **animais:** nome, raça, sexo, pelagem, nascimento, registro e associação, chip, proprietário (cliente), local onde fica, foto.
- **animal_arquivos:** documentos e fotos do animal (registro, exames, laudos).
- **convites_cadastro:** token do link, cliente (quando já existe), validade, data de uso.

### Catálogo

- **servicos:** nome, categoria, unidade de cobrança, valor, duração média em minutos, retorno em dias, tipo de ficha, quem realiza, ativo.
- **produtos:** classe, nome comercial, concentração, nome completo (montado pelo sistema), fabricante, categoria, unidade de uso, custo, preço de venda, estoque mínimo, cobrar do cliente por padrão, controla lote e validade, ativo.

### Atendimento

- **atendimentos:** número, cliente, local, veterinário, etapa, origem (proposta ou direto), data de cada mudança de etapa, validade da proposta, desconto, totais, observações, motivo de recusa.
- **atendimento_itens:** atendimento, animal, tipo (serviço, produto ou deslocamento), origem (proposta ou extra), quantidade, valor unitário, realizado (sim ou não), cobrar (sim ou não).
- **atendimento_historico:** de qual etapa para qual, quem moveu, quando.
- **rotas:** data, região, veterinários, ponto de partida, km previstos.
- **rota_paradas:** rota, atendimento, ordem, horário previsto, duração.
- **fichas:** atendimento, animal, tipo, veterinário, respostas (campo flexível), orientações ao tutor, retorno sugerido.
- **ficha_modelos:** os campos de cada um dos 11 tipos de ficha, editáveis sem mexer no código.
- **ficha_arquivos:** fotos e vídeos da ficha.
- **retornos:** animal, serviço, data prevista, situação (a vencer, agendado, feito).

### Financeiro e estoque

- **cobrancas:** atendimento, valor, forma de pagamento, parcelas, vencimento, situação, data do pagamento.
- **notas_fiscais:** cobrança, número, link, data de emissão.
- **estoque_lotes:** produto, lote, validade, quantidade.
- **estoque_movimentacoes:** produto, lote, tipo (entrada, saída, ajuste), quantidade, motivo, atendimento, usuário.
- **configuracoes_empresa:** razão social, CNPJ, contatos, Pix, textos do PDF da proposta, endereço de partida das rotas.

## Ordem de construção

Cada etapa é um prompt para o Claude Code. Só passe para a próxima depois de testar a anterior.

| Etapa | Entrega | Telas |
|---|---|---|
| 0 | Projeto criado, login, menu lateral e visual da marca, publicado na Vercel | Menu lateral |
| 1 | Banco de dados completo, com regras de acesso | — |
| 2 | Clientes, haras e locais, animais e o link de cadastro | 06, 07, 09, 10, 12 |
| 3 | Serviços e valores, produtos | 13, 14 |
| 4 | Fluxo e nova proposta, com PDF | 02, 08 |
| 5 | Agenda e rotas | 03 |
| 6 | Ficha no celular e fechamento do atendimento | 04, 11 |
| 7 | Cobranças e nota fiscal | 05 |
| 8 | Estoque | 15 |
| 9 | Início e avisos de retorno | 01 |
| 10 | Importação da planilha, testes com Fabi e Bruno, domínio | — |

## Prompt 0: fundação

Antes de colar: crie um repositório vazio no GitHub chamado `integrative-equus-sistema`, crie o projeto no Supabase e exporte as telas do canvas como imagens para a pasta `docs/telas` do repositório.

```
Você vai construir do zero o sistema de gestão da Integrative Equus, uma empresa
de medicina equina com dois veterinários (Fabi e Bruno) que atendem cavalos no
local, em rotas por Santa Catarina. O sistema é de uso interno.

Leia primeiro tudo o que está em docs/: as telas em docs/telas e o arquivo
docs/novo-sistema-plano-e-prompts.md, que descreve o banco e as etapas.
As telas são a referência visual e de usabilidade. Siga-as.

Nesta primeira etapa, faça só a fundação:

1. Projeto Next.js (App Router) com TypeScript e Tailwind.
2. Conexão com o Supabase usando @supabase/ssr. As chaves ficam em .env.local
   e nunca vão para o repositório. Crie um .env.example.
3. Login por e-mail e senha com Supabase Auth. Sem cadastro aberto: os usuários
   são criados pelo administrador. Todas as rotas exigem login, menos /cadastro.
4. Layout com menu lateral igual ao de docs/telas, com os grupos: Início, Fluxo,
   Agenda e rotas; Cadastros (Clientes, Animais, Haras e locais); Atendimento
   (Propostas, Fichas e fechamento); Financeiro (Cobranças, Notas fiscais);
   Catálogo (Serviços e valores, Produtos, Estoque). No celular o menu vira
   gaveta. Cada item abre uma página vazia com o título.
5. Identidade visual como tokens do Tailwind:
   bordô #7B2234, fundo #F6F2EC, superfície #FFFFFF, borda #E4DDD3,
   texto #2B2627, texto secundário #5A5D5E.
   Títulos em Spectral, interface em Hanken Grotesk (next/font).
   Situações: em dia #2A5434 sobre #E4EFE4, atenção #6E4700 sobre #FBF0D9,
   atraso #7B2234 sobre #F3E7E9, informação #1F4E79 sobre #E3EDF7.
6. Componentes base reutilizáveis: botão (primário, secundário, neutro), campo
   de texto, seletor, cartão, etiqueta de situação, tabela, filtros em pílula.
   Altura mínima de 44 px em tudo que é clicável.
7. Interface inteira em português do Brasil. Datas em dd/mm/aaaa, valores em R$.

Regras para o projeto inteiro:
- Não crie tabelas nesta etapa.
- Nada de dados de exemplo fixos no código.
- Faça commits pequenos, com mensagem em português.
- Ao terminar, me diga como rodar localmente e o que configurar na Vercel.
```

## Prompt 1: banco de dados

```
Agora crie o banco de dados no Supabase, conforme a seção "Tabelas do banco novo"
de docs/novo-sistema-plano-e-prompts.md.

1. Escreva as migrations em supabase/migrations, em SQL, uma por grupo
   (pessoas e lugares, catálogo, atendimento, financeiro e estoque).
2. Chaves primárias uuid, created_at e updated_at em todas as tabelas, e
   chaves estrangeiras com índice.
3. Crie como enum: perfil de usuário, etapa do atendimento (as 8 etapas mais
   concluido, recusado e cancelado), origem do atendimento, tipo de item,
   tipo de local, unidade de cobrança, unidade de uso do produto, forma de
   pagamento, situação da cobrança, tipo de movimentação de estoque.
4. Regras que o próprio banco deve garantir:
   - Toda mudança de etapa grava uma linha em atendimento_historico.
   - O saldo de cada produto é a soma dos lotes; movimentações atualizam o lote.
   - O nome completo do produto é montado a partir de classe, nome comercial e
     concentração, e não pode repetir.
   - Os totais do atendimento são recalculados quando os itens mudam.
   - Uma view diz, para cada cliente, se o cadastro está completo e o que falta
     (CPF, telefone, endereço, ao menos um animal, local do animal).
5. Segurança: ative RLS em todas as tabelas. Só usuários logados e ativos leem
   e escrevem. O perfil financeiro não altera fichas; o perfil veterinário não
   altera cobranças. Nenhuma tabela fica acessível sem login.
6. O link de cadastro do cliente funciona sem login, mas apenas por funções do
   banco que recebem o token do convite: validar o convite, gravar os dados do
   cliente, gravar animais e anexar o registro. O visitante nunca lê tabelas.
7. Storage: buckets privados para arquivos de animais e de fichas, com acesso
   só para usuários logados e para o envio feito pelo link de cadastro.
8. Gere os tipos TypeScript do banco em src/types/database.ts.
9. Crie um seed só com o mínimo: as regiões de rota, os 11 tipos de ficha
   (sem campos ainda) e a linha de configurações da empresa.

Antes de aplicar, me mostre a lista de tabelas e as regras de acesso para eu
aprovar. Não importe clientes nem produtos agora; isso é a etapa 10.
```

## Pontos em aberto

- **Regiões de rota:** confirmar a divisão com Fabi e Bruno (proposta: Litoral Norte, Vale do Itajaí, Grande Florianópolis, Sul, Planalto Serrano) e o valor de deslocamento de cada uma. Hoje o deslocamento é cobrado a R$ 3,00 por km.
- **Cidade de partida das rotas.**
- **Cálculo de distância e ordem das paradas:** usar um serviço de mapas pago (mais preciso, cobra por consulta) ou começar com distância aproximada e link para o Google Maps.
- **Fichas:** os campos de cada um dos 11 tipos. O sistema antigo tinha quiropraxia e ortopédica detalhadas, que servem de ponto de partida.
- **Nota fiscal:** só registrar número e link, ou emitir de dentro do sistema.
- **Serviços duplicados:** "Quiropraxia" (R$ 450, por sessão) e "Sessão de Quiropraxia" (R$ 250, por atendimento).
- **Supabase:** a conta tem dois projetos ativos; confirmar o limite do plano antes de criar o da Integrative.
