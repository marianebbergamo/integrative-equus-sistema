"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Card,
  Select,
  StatusTag,
  Table,
  TableHead,
  TableRow,
  Td,
  TextField,
  Th,
} from "@/components/ui";
import {
  atualizarUsuario,
  convidarUsuario,
  gerarLinkAcesso,
  type Perfil,
  type UsuarioConfig,
} from "./actions";

const PERFIS: { valor: Perfil; rotulo: string }[] = [
  { valor: "administrador", rotulo: "Administrador" },
  { valor: "veterinario", rotulo: "Veterinário" },
  { valor: "financeiro", rotulo: "Financeiro" },
];

interface LinkGerado {
  nome: string;
  link: string;
  convite: boolean;
}

export function UsuariosPainel({ usuarios }: { usuarios: UsuarioConfig[] }) {
  const [linkGerado, setLinkGerado] = useState<LinkGerado | null>(null);
  const [erro, setErro] = useState("");
  const [pendente, iniciar] = useTransition();

  function executar(acao: () => Promise<string | void>) {
    setErro("");
    iniciar(async () => {
      const mensagem = await acao();
      if (mensagem) setErro(mensagem);
    });
  }

  function convidar(formData: FormData) {
    const nome = String(formData.get("nome") ?? "");
    const email = String(formData.get("email") ?? "");
    const perfil = String(formData.get("perfil") ?? "") as Perfil;
    executar(async () => {
      const r = await convidarUsuario(nome, email, perfil);
      if (!r.ok) return r.erro;
      setLinkGerado({ nome, link: r.dados.link, convite: true });
    });
  }

  function gerarLink(usuario: UsuarioConfig) {
    executar(async () => {
      const r = await gerarLinkAcesso(usuario.id);
      if (!r.ok) return r.erro;
      setLinkGerado({ nome: usuario.nome, link: r.dados.link, convite: false });
    });
  }

  function atualizar(usuario: UsuarioConfig, mudancas: { perfil?: Perfil; ativo?: boolean }) {
    if (
      mudancas.ativo === false &&
      !window.confirm(`Desativar o acesso de ${usuario.nome}? A pessoa não vai mais conseguir entrar.`)
    ) {
      return;
    }
    executar(async () => {
      const r = await atualizarUsuario(usuario.id, mudancas);
      if (!r.ok) return r.erro;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {linkGerado && (
        <PainelLink linkGerado={linkGerado} onFechar={() => setLinkGerado(null)} />
      )}

      {erro && (
        <p role="alert" className="text-sm font-medium text-situacao-atraso-fg">
          {erro}
        </p>
      )}

      <Table>
        <TableHead>
          <tr>
            <Th>Nome</Th>
            <Th>E-mail</Th>
            <Th>Perfil</Th>
            <Th>Situação</Th>
            <Th>Último acesso</Th>
            <Th>
              <span className="sr-only">Ações</span>
            </Th>
          </tr>
        </TableHead>
        <tbody>
          {usuarios.map((u) => (
            <TableRow key={u.id}>
              <Td>
                {u.nome}
                {u.voce && (
                  <span className="ml-1.5 text-sm text-texto-secundario">(você)</span>
                )}
              </Td>
              <Td>{u.email}</Td>
              <Td>
                <Select
                  aria-label={`Perfil de ${u.nome}`}
                  value={u.perfil}
                  disabled={u.voce || pendente}
                  onChange={(e) => atualizar(u, { perfil: e.target.value as Perfil })}
                  className="min-w-40"
                >
                  {PERFIS.map((p) => (
                    <option key={p.valor} value={p.valor}>
                      {p.rotulo}
                    </option>
                  ))}
                </Select>
              </Td>
              <Td>
                {!u.ativo ? (
                  <StatusTag situacao="atraso">Inativo</StatusTag>
                ) : u.pendente ? (
                  <StatusTag situacao="atencao">Convite pendente</StatusTag>
                ) : (
                  <StatusTag situacao="em-dia">Ativo</StatusTag>
                )}
              </Td>
              <Td className="whitespace-nowrap text-texto-secundario">
                {u.ultimoAcesso
                  ? new Date(u.ultimoAcesso).toLocaleDateString("pt-BR")
                  : "Nunca entrou"}
              </Td>
              <Td>
                {!u.voce && (
                  <div className="flex justify-end gap-2">
                    {u.ativo && (
                      <Button
                        type="button"
                        variante="neutro"
                        disabled={pendente}
                        onClick={() => gerarLink(u)}
                      >
                        Link de acesso
                      </Button>
                    )}
                    <Button
                      type="button"
                      variante="secundario"
                      disabled={pendente}
                      onClick={() => atualizar(u, { ativo: !u.ativo })}
                    >
                      {u.ativo ? "Desativar" : "Reativar"}
                    </Button>
                  </div>
                )}
              </Td>
            </TableRow>
          ))}
        </tbody>
      </Table>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-titulo text-xl text-texto">Novo usuário</h3>
          <p className="text-sm text-texto-secundario">
            O sistema gera um link para a pessoa criar a própria senha. Você envia
            pelo WhatsApp.
          </p>
        </div>
        <form
          action={convidar}
          className="grid gap-4 md:grid-cols-[1fr_1fr_200px_auto] md:items-end"
        >
          <TextField label="Nome" name="nome" required />
          <TextField label="E-mail" name="email" type="email" required />
          <Select label="Perfil" name="perfil" defaultValue="veterinario">
            {PERFIS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={pendente}>
            {pendente ? "Criando…" : "Criar acesso"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function PainelLink({
  linkGerado,
  onFechar,
}: {
  linkGerado: LinkGerado;
  onFechar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const primeiroNome = linkGerado.nome.split(" ")[0];
  const mensagem = linkGerado.convite
    ? `Oi, ${primeiroNome}! Seu acesso ao sistema da Integrative Equus está pronto. Crie sua senha por este link: ${linkGerado.link}`
    : `Oi, ${primeiroNome}! Use este link para criar uma senha nova no sistema da Integrative Equus: ${linkGerado.link}`;

  async function copiar() {
    await navigator.clipboard.writeText(linkGerado.link);
    setCopiado(true);
  }

  return (
    <Card className="flex flex-col gap-3 border-bordo">
      <div className="flex flex-col gap-1">
        <h3 className="font-titulo text-xl text-texto">
          Link de acesso de {linkGerado.nome}
        </h3>
        <p className="text-sm text-texto-secundario">
          Envie agora: o link vale por 1 hora e só pode ser usado uma vez. Se
          expirar, gere outro em &quot;Link de acesso&quot;.
        </p>
      </div>
      <code className="truncate rounded-lg border border-borda bg-fundo px-3 py-2 text-sm">
        {linkGerado.link}
      </code>
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg bg-bordo px-4 text-sm font-semibold text-white hover:bg-bordo-escuro"
        >
          Enviar pelo WhatsApp
        </a>
        <Button type="button" variante="secundario" onClick={copiar}>
          {copiado ? "Copiado!" : "Copiar link"}
        </Button>
        <Button type="button" variante="neutro" onClick={onFechar}>
          Fechar
        </Button>
      </div>
    </Card>
  );
}
