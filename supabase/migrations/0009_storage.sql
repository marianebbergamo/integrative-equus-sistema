insert into storage.buckets (id, name, public)
values ('animais', 'animais', false), ('fichas', 'fichas', false);

create policy usuarios_ativos_leem_arquivos_animais on storage.objects
  for select using (bucket_id = 'animais' and usuario_atual_ativo());
create policy usuarios_ativos_enviam_arquivos_animais on storage.objects
  for insert with check (bucket_id = 'animais' and usuario_atual_ativo());
create policy usuarios_ativos_removem_arquivos_animais on storage.objects
  for delete using (bucket_id = 'animais' and usuario_atual_ativo());

create policy usuarios_ativos_leem_arquivos_fichas on storage.objects
  for select using (bucket_id = 'fichas' and usuario_atual_ativo());
create policy usuarios_ativos_enviam_arquivos_fichas on storage.objects
  for insert with check (bucket_id = 'fichas' and usuario_atual_ativo());
create policy usuarios_ativos_removem_arquivos_fichas on storage.objects
  for delete using (bucket_id = 'fichas' and usuario_atual_ativo());

-- O envio pelo link público de cadastro (sem login) é feito por uma rota do
-- Next.js que usa a chave de serviço, não pelo cliente direto no navegador.
-- Por isso não existe aqui uma policy de "anon" para o bucket "animais".
