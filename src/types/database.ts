export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      animais: {
        Row: {
          associacao: string | null
          chip: string | null
          cliente_id: string
          created_at: string
          foto_url: string | null
          id: string
          local_id: string | null
          nascimento: string | null
          nome: string
          pelagem: string | null
          raca: string | null
          registro: string | null
          sexo: Database["public"]["Enums"]["sexo_animal"] | null
          updated_at: string
        }
        Insert: {
          associacao?: string | null
          chip?: string | null
          cliente_id: string
          created_at?: string
          foto_url?: string | null
          id?: string
          local_id?: string | null
          nascimento?: string | null
          nome: string
          pelagem?: string | null
          raca?: string | null
          registro?: string | null
          sexo?: Database["public"]["Enums"]["sexo_animal"] | null
          updated_at?: string
        }
        Update: {
          associacao?: string | null
          chip?: string | null
          cliente_id?: string
          created_at?: string
          foto_url?: string | null
          id?: string
          local_id?: string | null
          nascimento?: string | null
          nome?: string
          pelagem?: string | null
          raca?: string | null
          registro?: string | null
          sexo?: Database["public"]["Enums"]["sexo_animal"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_cadastro_status"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "animais_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_arquivos: {
        Row: {
          animal_id: string
          created_at: string
          id: string
          nome_arquivo: string
          tipo: string
          url: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          id?: string
          nome_arquivo: string
          tipo: string
          url: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          id?: string
          nome_arquivo?: string
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_arquivos_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
        ]
      }
      atendimento_historico: {
        Row: {
          atendimento_id: string
          created_at: string
          de_etapa: Database["public"]["Enums"]["etapa_atendimento"] | null
          id: string
          para_etapa: Database["public"]["Enums"]["etapa_atendimento"]
          usuario_id: string | null
        }
        Insert: {
          atendimento_id: string
          created_at?: string
          de_etapa?: Database["public"]["Enums"]["etapa_atendimento"] | null
          id?: string
          para_etapa: Database["public"]["Enums"]["etapa_atendimento"]
          usuario_id?: string | null
        }
        Update: {
          atendimento_id?: string
          created_at?: string
          de_etapa?: Database["public"]["Enums"]["etapa_atendimento"] | null
          id?: string
          para_etapa?: Database["public"]["Enums"]["etapa_atendimento"]
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimento_historico_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimento_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      atendimento_itens: {
        Row: {
          animal_id: string | null
          atendimento_id: string
          cobrar: boolean
          created_at: string
          id: string
          origem: Database["public"]["Enums"]["origem_item_atendimento"]
          produto_id: string | null
          quantidade: number
          realizado: boolean
          servico_id: string | null
          tipo: Database["public"]["Enums"]["tipo_item_atendimento"]
          updated_at: string
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          animal_id?: string | null
          atendimento_id: string
          cobrar?: boolean
          created_at?: string
          id?: string
          origem?: Database["public"]["Enums"]["origem_item_atendimento"]
          produto_id?: string | null
          quantidade?: number
          realizado?: boolean
          servico_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_item_atendimento"]
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number
        }
        Update: {
          animal_id?: string | null
          atendimento_id?: string
          cobrar?: boolean
          created_at?: string
          id?: string
          origem?: Database["public"]["Enums"]["origem_item_atendimento"]
          produto_id?: string | null
          quantidade?: number
          realizado?: boolean
          servico_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_item_atendimento"]
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "atendimento_itens_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimento_itens_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimento_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimento_itens_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      atendimentos: {
        Row: {
          cliente_id: string
          created_at: string
          data_agendamento: string | null
          data_aprovacao: string | null
          data_atendimento: string | null
          data_cobranca: string | null
          data_fechamento: string | null
          data_nota_fiscal: string | null
          data_orcamento: string | null
          data_pagamento: string | null
          desconto: number
          etapa: Database["public"]["Enums"]["etapa_atendimento"]
          id: string
          local_id: string | null
          motivo_recusa: string | null
          numero: number
          observacoes: string | null
          origem: Database["public"]["Enums"]["origem_atendimento"]
          subtotal: number
          total: number
          updated_at: string
          validade_proposta: string | null
          veterinario_id: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_agendamento?: string | null
          data_aprovacao?: string | null
          data_atendimento?: string | null
          data_cobranca?: string | null
          data_fechamento?: string | null
          data_nota_fiscal?: string | null
          data_orcamento?: string | null
          data_pagamento?: string | null
          desconto?: number
          etapa?: Database["public"]["Enums"]["etapa_atendimento"]
          id?: string
          local_id?: string | null
          motivo_recusa?: string | null
          numero?: number
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_atendimento"]
          subtotal?: number
          total?: number
          updated_at?: string
          validade_proposta?: string | null
          veterinario_id?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_agendamento?: string | null
          data_aprovacao?: string | null
          data_atendimento?: string | null
          data_cobranca?: string | null
          data_fechamento?: string | null
          data_nota_fiscal?: string | null
          data_orcamento?: string | null
          data_pagamento?: string | null
          desconto?: number
          etapa?: Database["public"]["Enums"]["etapa_atendimento"]
          id?: string
          local_id?: string | null
          motivo_recusa?: string | null
          numero?: number
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_atendimento"]
          subtotal?: number
          total?: number
          updated_at?: string
          validade_proposta?: string | null
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_cadastro_status"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "atendimentos_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string
          documento: string | null
          email: string | null
          id: string
          indicado_por: string | null
          logradouro: string | null
          nome: string
          numero: string | null
          observacoes: string | null
          telefone: string | null
          uf: string | null
          updated_at: string
          veterinario_referencia_id: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          indicado_por?: string | null
          logradouro?: string | null
          nome: string
          numero?: string | null
          observacoes?: string | null
          telefone?: string | null
          uf?: string | null
          updated_at?: string
          veterinario_referencia_id?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          indicado_por?: string | null
          logradouro?: string | null
          nome?: string
          numero?: string | null
          observacoes?: string | null
          telefone?: string | null
          uf?: string | null
          updated_at?: string
          veterinario_referencia_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_veterinario_referencia_id_fkey"
            columns: ["veterinario_referencia_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cobrancas: {
        Row: {
          atendimento_id: string
          created_at: string
          data_pagamento: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"] | null
          id: string
          parcelas: number
          situacao: Database["public"]["Enums"]["situacao_cobranca"]
          updated_at: string
          valor: number
          vencimento: string | null
        }
        Insert: {
          atendimento_id: string
          created_at?: string
          data_pagamento?: string | null
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          parcelas?: number
          situacao?: Database["public"]["Enums"]["situacao_cobranca"]
          updated_at?: string
          valor?: number
          vencimento?: string | null
        }
        Update: {
          atendimento_id?: string
          created_at?: string
          data_pagamento?: string | null
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          parcelas?: number
          situacao?: Database["public"]["Enums"]["situacao_cobranca"]
          updated_at?: string
          valor?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_empresa: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco_partida_rotas: string | null
          id: boolean
          pix_chave: string | null
          razao_social: string | null
          telefone: string | null
          texto_pdf_proposta: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco_partida_rotas?: string | null
          id?: boolean
          pix_chave?: string | null
          razao_social?: string | null
          telefone?: string | null
          texto_pdf_proposta?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco_partida_rotas?: string | null
          id?: boolean
          pix_chave?: string | null
          razao_social?: string | null
          telefone?: string | null
          texto_pdf_proposta?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      convites_cadastro: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: string
          token: string
          usado_em: string | null
          validade: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          token?: string
          usado_em?: string | null
          validade: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          token?: string
          usado_em?: string | null
          validade?: string
        }
        Relationships: [
          {
            foreignKeyName: "convites_cadastro_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_cadastro_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_cadastro_status"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      estoque_lotes: {
        Row: {
          created_at: string
          id: string
          lote: string | null
          produto_id: string
          quantidade: number
          updated_at: string
          validade: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lote?: string | null
          produto_id: string
          quantidade?: number
          updated_at?: string
          validade?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lote?: string | null
          produto_id?: string
          quantidade?: number
          updated_at?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_lotes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_movimentacoes: {
        Row: {
          atendimento_id: string | null
          created_at: string
          id: string
          lote_id: string | null
          motivo: string | null
          produto_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          usuario_id: string | null
        }
        Insert: {
          atendimento_id?: string | null
          created_at?: string
          id?: string
          lote_id?: string | null
          motivo?: string | null
          produto_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          usuario_id?: string | null
        }
        Update: {
          atendimento_id?: string | null
          created_at?: string
          id?: string
          lote_id?: string | null
          motivo?: string | null
          produto_id?: string
          quantidade?: number
          tipo?: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentacoes_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "estoque_lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ficha_arquivos: {
        Row: {
          created_at: string
          ficha_id: string
          id: string
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          ficha_id: string
          id?: string
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          ficha_id?: string
          id?: string
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ficha_arquivos_ficha_id_fkey"
            columns: ["ficha_id"]
            isOneToOne: false
            referencedRelation: "fichas"
            referencedColumns: ["id"]
          },
        ]
      }
      ficha_modelos: {
        Row: {
          ativo: boolean
          campos: Json
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          campos?: Json
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          campos?: Json
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      fichas: {
        Row: {
          animal_id: string
          atendimento_id: string
          created_at: string
          ficha_modelo_id: string | null
          id: string
          orientacoes_tutor: string | null
          respostas: Json
          retorno_sugerido_dias: number | null
          updated_at: string
          veterinario_id: string | null
        }
        Insert: {
          animal_id: string
          atendimento_id: string
          created_at?: string
          ficha_modelo_id?: string | null
          id?: string
          orientacoes_tutor?: string | null
          respostas?: Json
          retorno_sugerido_dias?: number | null
          updated_at?: string
          veterinario_id?: string | null
        }
        Update: {
          animal_id?: string
          atendimento_id?: string
          created_at?: string
          ficha_modelo_id?: string | null
          id?: string
          orientacoes_tutor?: string | null
          respostas?: Json
          retorno_sugerido_dias?: number | null
          updated_at?: string
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fichas_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_ficha_modelo_id_fkey"
            columns: ["ficha_modelo_id"]
            isOneToOne: false
            referencedRelation: "ficha_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      locais: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          como_chegar: string | null
          complemento: string | null
          created_at: string
          id: string
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          nome: string
          numero: string | null
          regiao_id: string | null
          responsavel_nome: string | null
          responsavel_telefone: string | null
          tipo: Database["public"]["Enums"]["tipo_local"]
          uf: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          como_chegar?: string | null
          complemento?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome: string
          numero?: string | null
          regiao_id?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          tipo: Database["public"]["Enums"]["tipo_local"]
          uf?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          como_chegar?: string | null
          complemento?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome?: string
          numero?: string | null
          regiao_id?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_local"]
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locais_regiao_id_fkey"
            columns: ["regiao_id"]
            isOneToOne: false
            referencedRelation: "regioes"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          cobranca_id: string
          created_at: string
          data_emissao: string | null
          id: string
          link: string | null
          numero: string | null
          updated_at: string
        }
        Insert: {
          cobranca_id: string
          created_at?: string
          data_emissao?: string | null
          id?: string
          link?: string | null
          numero?: string | null
          updated_at?: string
        }
        Update: {
          cobranca_id?: string
          created_at?: string
          data_emissao?: string | null
          id?: string
          link?: string | null
          numero?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_cobranca_id_fkey"
            columns: ["cobranca_id"]
            isOneToOne: false
            referencedRelation: "cobrancas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria: string | null
          classe: string
          cobrar_cliente_padrao: boolean
          concentracao: string | null
          controla_lote_validade: boolean
          created_at: string
          custo: number
          estoque_minimo: number
          fabricante: string | null
          id: string
          nome_comercial: string
          nome_completo: string | null
          preco_venda: number
          unidade_uso: Database["public"]["Enums"]["unidade_uso_produto"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          classe: string
          cobrar_cliente_padrao?: boolean
          concentracao?: string | null
          controla_lote_validade?: boolean
          created_at?: string
          custo?: number
          estoque_minimo?: number
          fabricante?: string | null
          id?: string
          nome_comercial: string
          nome_completo?: string | null
          preco_venda?: number
          unidade_uso: Database["public"]["Enums"]["unidade_uso_produto"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          classe?: string
          cobrar_cliente_padrao?: boolean
          concentracao?: string | null
          controla_lote_validade?: boolean
          created_at?: string
          custo?: number
          estoque_minimo?: number
          fabricante?: string | null
          id?: string
          nome_comercial?: string
          nome_completo?: string | null
          preco_venda?: number
          unidade_uso?: Database["public"]["Enums"]["unidade_uso_produto"]
          updated_at?: string
        }
        Relationships: []
      }
      regioes: {
        Row: {
          created_at: string
          id: string
          nome: string
          ordem: number
          updated_at: string
          valor_deslocamento_km: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
          valor_deslocamento_km?: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
          valor_deslocamento_km?: number
        }
        Relationships: []
      }
      retornos: {
        Row: {
          animal_id: string
          created_at: string
          data_prevista: string
          id: string
          servico_id: string | null
          situacao: Database["public"]["Enums"]["situacao_retorno"]
          updated_at: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          data_prevista: string
          id?: string
          servico_id?: string | null
          situacao?: Database["public"]["Enums"]["situacao_retorno"]
          updated_at?: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          data_prevista?: string
          id?: string
          servico_id?: string | null
          situacao?: Database["public"]["Enums"]["situacao_retorno"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retornos_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retornos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_paradas: {
        Row: {
          atendimento_id: string
          created_at: string
          duracao_minutos: number | null
          horario_previsto: string | null
          id: string
          ordem: number
          rota_id: string
          updated_at: string
        }
        Insert: {
          atendimento_id: string
          created_at?: string
          duracao_minutos?: number | null
          horario_previsto?: string | null
          id?: string
          ordem: number
          rota_id: string
          updated_at?: string
        }
        Update: {
          atendimento_id?: string
          created_at?: string
          duracao_minutos?: number | null
          horario_previsto?: string | null
          id?: string
          ordem?: number
          rota_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_paradas_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_paradas_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_veterinarios: {
        Row: {
          rota_id: string
          usuario_id: string
        }
        Insert: {
          rota_id: string
          usuario_id: string
        }
        Update: {
          rota_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_veterinarios_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_veterinarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rotas: {
        Row: {
          created_at: string
          data: string
          id: string
          km_previstos: number | null
          ponto_partida: string | null
          regiao_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          km_previstos?: number | null
          ponto_partida?: string | null
          regiao_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          km_previstos?: number | null
          ponto_partida?: string | null
          regiao_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotas_regiao_id_fkey"
            columns: ["regiao_id"]
            isOneToOne: false
            referencedRelation: "regioes"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          duracao_media_minutos: number | null
          id: string
          nome: string
          quem_realiza: Database["public"]["Enums"]["perfil_usuario"] | null
          retorno_dias: number | null
          tipo_ficha: string | null
          unidade_cobranca: Database["public"]["Enums"]["unidade_cobranca_servico"]
          updated_at: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          duracao_media_minutos?: number | null
          id?: string
          nome: string
          quem_realiza?: Database["public"]["Enums"]["perfil_usuario"] | null
          retorno_dias?: number | null
          tipo_ficha?: string | null
          unidade_cobranca: Database["public"]["Enums"]["unidade_cobranca_servico"]
          updated_at?: string
          valor?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          duracao_media_minutos?: number | null
          id?: string
          nome?: string
          quem_realiza?: Database["public"]["Enums"]["perfil_usuario"] | null
          retorno_dias?: number | null
          tipo_ficha?: string | null
          unidade_cobranca?: Database["public"]["Enums"]["unidade_cobranca_servico"]
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      clientes_cadastro_status: {
        Row: {
          cadastro_completo: boolean | null
          cliente_id: string | null
          tem_animal: boolean | null
          tem_animal_com_local: boolean | null
          tem_documento: boolean | null
          tem_endereco: boolean | null
          tem_telefone: boolean | null
        }
        Insert: {
          cadastro_completo?: never
          cliente_id?: string | null
          tem_animal?: never
          tem_animal_com_local?: never
          tem_documento?: never
          tem_endereco?: never
          tem_telefone?: never
        }
        Update: {
          cadastro_completo?: never
          cliente_id?: string | null
          tem_animal?: never
          tem_animal_com_local?: never
          tem_documento?: never
          tem_endereco?: never
          tem_telefone?: never
        }
        Relationships: []
      }
    }
    Functions: {
      anexar_arquivo_animal_por_convite: {
        Args: {
          p_animal_id: string
          p_nome_arquivo: string
          p_tipo: string
          p_token: string
          p_url: string
        }
        Returns: string
      }
      cadastrar_animal_por_convite: {
        Args: {
          p_associacao: string
          p_chip: string
          p_local_id: string
          p_nascimento: string
          p_nome: string
          p_pelagem: string
          p_raca: string
          p_registro: string
          p_sexo: Database["public"]["Enums"]["sexo_animal"]
          p_token: string
        }
        Returns: string
      }
      cadastrar_cliente_por_convite: {
        Args: {
          p_bairro: string
          p_cep: string
          p_cidade: string
          p_complemento: string
          p_documento: string
          p_email: string
          p_logradouro: string
          p_nome: string
          p_numero: string
          p_telefone: string
          p_token: string
          p_uf: string
        }
        Returns: string
      }
      usuario_atual_ativo: { Args: never; Returns: boolean }
      usuario_atual_perfil: {
        Args: never
        Returns: Database["public"]["Enums"]["perfil_usuario"]
      }
      validar_convite_cadastro: {
        Args: { p_token: string }
        Returns: {
          cliente_id: string
          convite_id: string
          valido: boolean
        }[]
      }
    }
    Enums: {
      etapa_atendimento:
        | "orcamento_a_fazer"
        | "aguardando_aprovacao"
        | "a_agendar"
        | "agendado"
        | "registrar_atendimento"
        | "a_cobrar"
        | "aguardando_pagamento"
        | "emitir_nota_fiscal"
        | "concluido"
        | "recusado"
        | "cancelado"
      forma_pagamento:
        | "pix"
        | "cartao_credito"
        | "cartao_debito"
        | "dinheiro"
        | "transferencia"
        | "boleto"
      origem_atendimento: "proposta" | "direto"
      origem_item_atendimento: "proposta" | "extra"
      perfil_usuario: "administrador" | "veterinario" | "financeiro"
      sexo_animal: "macho" | "femea"
      situacao_cobranca: "a_vencer" | "vencida" | "paga" | "cancelada"
      situacao_retorno: "a_vencer" | "agendado" | "feito"
      tipo_item_atendimento: "servico" | "produto" | "deslocamento"
      tipo_local: "haras" | "ct" | "fazenda" | "propriedade_cliente"
      tipo_movimentacao_estoque: "entrada" | "saida" | "ajuste"
      unidade_cobranca_servico:
        | "sessao"
        | "atendimento"
        | "animal"
        | "pacote"
        | "hora"
      unidade_uso_produto:
        | "ml"
        | "mg"
        | "dose"
        | "unidade"
        | "frasco"
        | "comprimido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      etapa_atendimento: [
        "orcamento_a_fazer",
        "aguardando_aprovacao",
        "a_agendar",
        "agendado",
        "registrar_atendimento",
        "a_cobrar",
        "aguardando_pagamento",
        "emitir_nota_fiscal",
        "concluido",
        "recusado",
        "cancelado",
      ],
      forma_pagamento: [
        "pix",
        "cartao_credito",
        "cartao_debito",
        "dinheiro",
        "transferencia",
        "boleto",
      ],
      origem_atendimento: ["proposta", "direto"],
      origem_item_atendimento: ["proposta", "extra"],
      perfil_usuario: ["administrador", "veterinario", "financeiro"],
      sexo_animal: ["macho", "femea"],
      situacao_cobranca: ["a_vencer", "vencida", "paga", "cancelada"],
      situacao_retorno: ["a_vencer", "agendado", "feito"],
      tipo_item_atendimento: ["servico", "produto", "deslocamento"],
      tipo_local: ["haras", "ct", "fazenda", "propriedade_cliente"],
      tipo_movimentacao_estoque: ["entrada", "saida", "ajuste"],
      unidade_cobranca_servico: [
        "sessao",
        "atendimento",
        "animal",
        "pacote",
        "hora",
      ],
      unidade_uso_produto: [
        "ml",
        "mg",
        "dose",
        "unidade",
        "frasco",
        "comprimido",
      ],
    },
  },
} as const
