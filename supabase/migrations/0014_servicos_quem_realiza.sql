-- "Quem realiza" é uma pessoa específica (Fabi ou Bruno), não um perfil
-- genérico; nulo quer dizer "qualquer veterinário".
alter table servicos add column quem_realiza_id uuid references usuarios (id) on delete set null;
alter table servicos drop column quem_realiza;
