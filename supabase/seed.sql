-- Dados mínimos para o sistema funcionar. Ajuste depois com Fabi e Bruno:
-- a divisão das regiões e o valor de deslocamento de cada uma ainda não
-- foram confirmados (ver "Pontos em aberto" em docs/novo-sistema-plano-e-prompts.md).
insert into regioes (nome, valor_deslocamento_km, ordem) values
  ('Litoral Norte', 3.00, 1),
  ('Vale do Itajaí', 3.00, 2),
  ('Grande Florianópolis', 3.00, 3),
  ('Sul', 3.00, 4),
  ('Planalto Serrano', 3.00, 5);

insert into configuracoes_empresa (id) values (true);

-- Associa à tabela usuarios os logins já criados no Supabase Auth
-- (Authentication > Users). Repita este padrão para cada novo usuário.
insert into usuarios (id, nome, email, perfil)
select id, 'Mariane', email, 'administrador' from auth.users where email = 'mariane.bbergamo@gmail.com';

insert into usuarios (id, nome, email, perfil)
select id, 'Bruno', email, 'veterinario' from auth.users where email = 'brunoc.evaristo@gmail.com';

-- Os 11 tipos de ficha, vistos na tela 13-Servicos.dc.html (seletor
-- "Ficha de atendimento"). Os campos de cada um ainda não foram
-- definidos (ver "Pontos em aberto").
insert into ficha_modelos (nome) values
  ('Quiropraxia'),
  ('Geral'),
  ('Ortopédico'),
  ('Fisioterapia'),
  ('Odontologia'),
  ('Controle sanitário'),
  ('Exame clínico'),
  ('Dermatologia'),
  ('Reprodução'),
  ('Neurológico'),
  ('Nutrição');
