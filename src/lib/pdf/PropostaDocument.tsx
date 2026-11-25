import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { LOGO_HORIZONTAL_PNG } from "./logo";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#2B2627", fontFamily: "Helvetica" },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#7B2234",
    paddingBottom: 14,
    marginBottom: 20,
  },
  logo: { width: 170, height: 54 },
  sub: { fontSize: 9, color: "#5A5D5E", marginTop: 2, letterSpacing: 1 },
  tituloProposta: { fontSize: 14, textAlign: "right" },
  secao: { marginBottom: 16 },
  rotuloSecao: {
    fontSize: 9,
    color: "#5A5D5E",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  linha: { fontSize: 12 },
  tabela: { marginTop: 8 },
  linhaTabelaCabecalho: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CFC8BF",
    paddingBottom: 6,
    marginBottom: 6,
  },
  linhaTabela: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE8E0",
    paddingVertical: 6,
  },
  colItem: { flex: 3 },
  colQtd: { flex: 1, textAlign: "center" },
  colValor: { flex: 1, textAlign: "right" },
  colSub: { flex: 1, textAlign: "right" },
  cabecalhoTexto: { fontSize: 9, color: "#5A5D5E", textTransform: "uppercase" },
  resumo: { marginTop: 16, alignSelf: "flex-end", width: 220 },
  resumoLinha: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  resumoTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E4DDD3",
    paddingTop: 6,
    marginTop: 4,
  },
  totalValor: { fontSize: 16, color: "#7B2234" },
  rodape: { marginTop: 30, fontSize: 9, color: "#5A5D5E" },
});

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string | null) {
  if (!data) return "—";
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export interface PropostaDocumentProps {
  numero: number;
  dataEmissao: string;
  validade: string | null;
  cliente: { nome: string; telefone: string | null; email: string | null };
  animalNome: string | null;
  localNome: string | null;
  veterinarioNome: string | null;
  observacoes: string | null;
  itens: {
    nome: string;
    info: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
  subtotal: number;
  desconto: number;
  total: number;
}

export function PropostaDocument({
  numero,
  dataEmissao,
  validade,
  cliente,
  animalNome,
  localNome,
  veterinarioNome,
  observacoes,
  itens,
  subtotal,
  desconto,
  total,
}: PropostaDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalho}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image do react-pdf não tem alt */}
          <Image src={LOGO_HORIZONTAL_PNG} style={styles.logo} />
          <View>
            <Text style={styles.tituloProposta}>Proposta nº {numero}</Text>
            <Text style={styles.sub}>Emitida em {formatarData(dataEmissao)}</Text>
            <Text style={styles.sub}>Válida até {formatarData(validade)}</Text>
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.rotuloSecao}>Para quem</Text>
          <Text style={styles.linha}>{cliente.nome}</Text>
          {animalNome && <Text style={styles.linha}>Animal: {animalNome}</Text>}
          {localNome && <Text style={styles.linha}>Local: {localNome}</Text>}
          {veterinarioNome && <Text style={styles.linha}>Veterinário: {veterinarioNome}</Text>}
        </View>

        <View style={styles.secao}>
          <Text style={styles.rotuloSecao}>Serviços e produtos</Text>
          <View style={styles.tabela}>
            <View style={styles.linhaTabelaCabecalho}>
              <Text style={[styles.colItem, styles.cabecalhoTexto]}>Item</Text>
              <Text style={[styles.colQtd, styles.cabecalhoTexto]}>Qtd.</Text>
              <Text style={[styles.colValor, styles.cabecalhoTexto]}>Valor</Text>
              <Text style={[styles.colSub, styles.cabecalhoTexto]}>Subtotal</Text>
            </View>
            {itens.map((item, indice) => (
              <View key={indice} style={styles.linhaTabela}>
                <Text style={styles.colItem}>
                  {item.nome}
                  {item.info ? ` — ${item.info}` : ""}
                </Text>
                <Text style={styles.colQtd}>{item.quantidade}</Text>
                <Text style={styles.colValor}>{formatarMoeda(item.valorUnitario)}</Text>
                <Text style={styles.colSub}>{formatarMoeda(item.valorTotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.resumo}>
            <View style={styles.resumoLinha}>
              <Text>Subtotal</Text>
              <Text>{formatarMoeda(subtotal)}</Text>
            </View>
            <View style={styles.resumoLinha}>
              <Text>Desconto</Text>
              <Text>-{formatarMoeda(desconto)}</Text>
            </View>
            <View style={styles.resumoTotal}>
              <Text>Total</Text>
              <Text style={styles.totalValor}>{formatarMoeda(total)}</Text>
            </View>
          </View>
        </View>

        {observacoes && (
          <View style={styles.secao}>
            <Text style={styles.rotuloSecao}>Observações</Text>
            <Text style={styles.linha}>{observacoes}</Text>
          </View>
        )}

        <Text style={styles.rodape}>
          {cliente.telefone && `Telefone: ${cliente.telefone}`}
          {cliente.telefone && cliente.email && " · "}
          {cliente.email}
        </Text>
      </Page>
    </Document>
  );
}
