# Integrative Equus — Sistema de gestão

Sistema interno de gestão da Integrative Equus (Next.js, TypeScript, Tailwind
e Supabase). Uso restrito à equipe: Fabi, Bruno e financeiro.

Documentação de referência em [docs/novo-sistema-plano-e-prompts.md](docs/novo-sistema-plano-e-prompts.md)
e as telas aprovadas em `docs/telas/`.

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha com os valores do
   projeto Supabase (veja a seção abaixo).

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000).

## Configuração do Supabase

O projeto ainda não existe. Para criar:

1. Crie um projeto novo em [supabase.com/dashboard](https://supabase.com/dashboard),
   região São Paulo. **Não reaproveite o projeto pausado "Integrative-Equus-FB".**
2. Em Project Settings > API, copie a **Project URL** e a chave
   **anon public**.
3. Cole esses valores em `.env.local` como `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Em Authentication > Users, crie manualmente os usuários da equipe
   (não há cadastro aberto).

## Publicando na Vercel

1. Importe o repositório `integrative-equus-sistema` em
   [vercel.com/new](https://vercel.com/new).
2. Em Environment Variables, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os mesmos valores de `.env.local`.
3. Faça o deploy.
