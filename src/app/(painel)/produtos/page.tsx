import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Button,
  Card,
  PageHeader,
  StatusTag,
  Table,
  TableHead,
  TableRow,
  Th,
  Td,
} from "@/components/ui";
import { UNIDADES_USO_PRODUTO } from "@/lib/catalogoOpcoes";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const supabase = await createClient();

  const { data: produtos, error } = await supabase
    .from("produtos")
    .select("id, nome_completo, fabricante, categoria, unidade_uso, custo, preco_venda, cobrar_cliente_padrao")
    .order("nome_completo");

  if (error) {
    throw new Error("Não foi possível carregar os produtos: " + error.message);
  }

  const selecionadoId = id ?? produtos?.[0]?.id;

  const { data: produto } = selecionadoId
    ? await supabase.from("produtos").select("*").eq("id", selecionadoId).single()
    : { data: null };

  return (
    <>
      <PageHeader
        titulo="Produtos"
        descricao="Cadastro de medicamentos e materiais. As quantidades ficam em Estoque."
        acoes={
          <>
            <Link href="/estoque">
              <Button variante="secundario">Ir para o estoque</Button>
            </Link>
            <Link href="/produtos/novo">
              <Button>Novo produto</Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-start gap-5">
        <Table className="flex-[999_1_520px]">
          <TableHead>
            <tr>
              <Th>Produto</Th>
              <Th>Categoria</Th>
              <Th>Unidade</Th>
              <Th className="text-right">Custo</Th>
              <Th className="text-right">Venda</Th>
            </tr>
          </TableHead>
          <tbody>
            {(produtos ?? []).map((p) => (
              <TableRow
                key={p.id}
                className={p.id === selecionadoId ? "bg-fundo" : undefined}
              >
                <Td>
                  <Link href={`/produtos?id=${p.id}`} className="font-semibold">
                    {p.nome_completo}
                  </Link>
                  <br />
                  <span className="text-[13px] text-texto-secundario">
                    {p.fabricante ?? "sem fabricante"}
                  </span>
                </Td>
                <Td>{p.categoria ?? "sem categoria"}</Td>
                <Td className="whitespace-nowrap">{UNIDADES_USO_PRODUTO[p.unidade_uso]}</Td>
                <Td className="text-right whitespace-nowrap">{formatarMoeda(p.custo)}</Td>
                <Td className="text-right font-semibold whitespace-nowrap">
                  {p.cobrar_cliente_padrao ? formatarMoeda(p.preco_venda) : "não cobrado"}
                </Td>
              </TableRow>
            ))}
            {(produtos ?? []).length === 0 && (
              <TableRow>
                <Td colSpan={5} className="text-center text-texto-secundario">
                  Nenhum produto cadastrado ainda.
                </Td>
              </TableRow>
            )}
          </tbody>
        </Table>

        {produto && (
          <Card className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
            <h2 className="font-titulo text-[22px] font-normal">{produto.nome_completo}</h2>
            <dl className="flex flex-col gap-2.5 text-[15px]">
              <div>
                <dt className="text-[13px] text-texto-secundario">Fabricante</dt>
                <dd>{produto.fabricante ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">Unidade de uso</dt>
                <dd>{UNIDADES_USO_PRODUTO[produto.unidade_uso]}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">Custo · Venda</dt>
                <dd>
                  {formatarMoeda(produto.custo)} ·{" "}
                  {produto.cobrar_cliente_padrao ? formatarMoeda(produto.preco_venda) : "não cobrado"}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-texto-secundario">Estoque mínimo</dt>
                <dd>{produto.estoque_minimo}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              {produto.controla_lote_validade && (
                <StatusTag situacao="informacao">Controla lote e validade</StatusTag>
              )}
              {!produto.ativo && <StatusTag situacao="atencao">Inativo</StatusTag>}
            </div>
            <Link href={`/produtos/${produto.id}/editar`}>
              <Button variante="secundario">Editar</Button>
            </Link>
          </Card>
        )}
      </div>
    </>
  );
}
