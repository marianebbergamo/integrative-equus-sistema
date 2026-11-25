export interface NavItem {
  label: string;
  href: string;
  icone: string;
}

export interface NavGroup {
  titulo: string | null;
  itens: NavItem[];
}

export const GRUPOS_NAVEGACAO: NavGroup[] = [
  {
    titulo: null,
    itens: [
      { label: "Início", href: "/", icone: "M4 11l8-7 8 7v9h-5v-6H9v6H4z" },
      {
        label: "Fluxo",
        href: "/fluxo",
        icone: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z",
      },
      {
        label: "Agenda e rotas",
        href: "/agenda",
        icone: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4",
      },
    ],
  },
  {
    titulo: "Cadastros",
    itens: [
      {
        label: "Clientes",
        href: "/clientes",
        icone: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c1-4 4-5 8-5s7 1 8 5",
      },
      {
        label: "Animais",
        href: "/animais",
        icone: "M4 7h16v12H4zM8 12h4M8 15h8",
      },
      {
        label: "Haras e locais",
        href: "/haras",
        icone:
          "M12 21s-6-6-6-11a6 6 0 0112 0c0 5-6 11-6 11zM12 12a2 2 0 100-4 2 2 0 000 4z",
      },
    ],
  },
  {
    titulo: "Atendimento",
    itens: [
      {
        label: "Propostas",
        href: "/propostas",
        icone: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5",
      },
      {
        label: "Fichas e fechamento",
        href: "/fichas",
        icone: "M8 5h8v3H8zM6 6H5v15h14V6h-1M9 13h6M9 17h6",
      },
    ],
  },
  {
    titulo: "Financeiro",
    itens: [
      {
        label: "Cobranças",
        href: "/financeiro",
        icone: "M4 7h16v11H4zM4 11h16M8 15h3",
      },
      {
        label: "Notas fiscais",
        href: "/notas-fiscais",
        icone: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
      },
    ],
  },
  {
    titulo: "Catálogo",
    itens: [
      {
        label: "Serviços e valores",
        href: "/servicos",
        icone: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v8M8 12h8",
      },
      {
        label: "Produtos",
        href: "/produtos",
        icone: "M4 8l8-4 8 4v9l-8 4-8-4zM4 8l8 4 8-4M12 12v9",
      },
      {
        label: "Estoque",
        href: "/estoque",
        icone: "M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4",
      },
    ],
  },
];

export const ITEM_CONFIGURACOES: NavItem = {
  label: "Configurações",
  href: "/configuracoes",
  icone:
    "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z",
};
