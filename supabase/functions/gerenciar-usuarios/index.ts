import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const ORIGENS = [
  "https://sistema.integrativeequus.com.br",
  "http://localhost:3000",
];
const PERFIS = ["administrador", "veterinario", "financeiro"];
const BANIMENTO = "876000h";

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return resposta({ erro: "Método não aceito." }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
  const { data: autenticado } = await admin.auth.getUser(jwt);
  const quemPede = autenticado.user;
  if (!quemPede) return resposta({ erro: "Sessão inválida." }, 401);

  const { data: eu } = await admin
    .from("usuarios")
    .select("perfil, ativo")
    .eq("id", quemPede.id)
    .single();
  if (eu?.perfil !== "administrador" || !eu.ativo) {
    return resposta({ erro: "Só administradores gerenciam acessos." }, 403);
  }

  const corpo = await req.json().catch(() => ({}));
  const origem = ORIGENS.includes(corpo.origem) ? corpo.origem : ORIGENS[0];
  // O link leva a uma página com formulário: a pré-visualização do WhatsApp
  // abre o link sem enviar o formulário, então não gasta o código de uso único.
  const montarLink = (hash: string, tipo: string) =>
    `${origem}/login/nova-senha?token_hash=${encodeURIComponent(hash)}&tipo=${tipo}`;

  if (corpo.acao === "listar") {
    const [{ data: usuarios }, { data: contas }] = await Promise.all([
      admin.from("usuarios").select("id, nome, email, perfil, ativo").order("nome"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);
    const porId = new Map((contas?.users ?? []).map((c) => [c.id, c]));
    return resposta({
      usuarios: (usuarios ?? []).map((u) => ({
        ...u,
        voce: u.id === quemPede.id,
        pendente: !porId.get(u.id)?.email_confirmed_at,
        ultimoAcesso: porId.get(u.id)?.last_sign_in_at ?? null,
      })),
    });
  }

  if (corpo.acao === "convidar") {
    const nome = String(corpo.nome ?? "").trim();
    const email = String(corpo.email ?? "").trim().toLowerCase();
    const perfil = String(corpo.perfil ?? "");
    if (!nome || !email.includes("@") || !PERFIS.includes(perfil)) {
      return resposta({ erro: "Preencha nome, e-mail e perfil." }, 400);
    }

    const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email });
    if (error || !data.user) {
      const jaExiste = error?.code === "email_exists" || /already/i.test(error?.message ?? "");
      return resposta(
        { erro: jaExiste ? "Este e-mail já tem acesso." : "Não foi possível criar o acesso." },
        400,
      );
    }

    const { error: erroUsuario } = await admin
      .from("usuarios")
      .insert({ id: data.user.id, nome, email, perfil });
    if (erroUsuario) {
      await admin.auth.admin.deleteUser(data.user.id);
      return resposta({ erro: "Não foi possível salvar o usuário." }, 500);
    }

    return resposta({ link: montarLink(data.properties.hashed_token, "invite") });
  }

  if (corpo.acao === "gerar_link") {
    const { data: alvo } = await admin
      .from("usuarios")
      .select("email, ativo")
      .eq("id", String(corpo.usuario_id ?? ""))
      .single();
    if (!alvo?.email) return resposta({ erro: "Usuário não encontrado." }, 404);
    if (!alvo.ativo) return resposta({ erro: "Reative o usuário antes de gerar o link." }, 400);

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: alvo.email,
    });
    if (error) return resposta({ erro: "Não foi possível gerar o link." }, 500);

    return resposta({ link: montarLink(data.properties.hashed_token, "recovery") });
  }

  if (corpo.acao === "atualizar") {
    const usuarioId = String(corpo.usuario_id ?? "");
    if (usuarioId === quemPede.id) {
      return resposta({ erro: "Você não pode mudar o seu próprio perfil ou acesso." }, 400);
    }

    const mudancas: { perfil?: string; ativo?: boolean; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (corpo.perfil !== undefined) {
      if (!PERFIS.includes(corpo.perfil)) return resposta({ erro: "Perfil inválido." }, 400);
      mudancas.perfil = corpo.perfil;
    }
    if (typeof corpo.ativo === "boolean") mudancas.ativo = corpo.ativo;

    const { error } = await admin.from("usuarios").update(mudancas).eq("id", usuarioId);
    if (error) return resposta({ erro: "Não foi possível salvar." }, 500);

    if (typeof corpo.ativo === "boolean") {
      await admin.auth.admin.updateUserById(usuarioId, {
        ban_duration: corpo.ativo ? "none" : BANIMENTO,
      });
    }

    return resposta({ ok: true });
  }

  return resposta({ erro: "Ação desconhecida." }, 400);
});
