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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          id: string
          limite_mensal: number | null
          nome: string
          origem: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          limite_mensal?: number | null
          nome: string
          origem: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          limite_mensal?: number | null
          nome?: string
          origem?: string
          tipo?: string
        }
        Relationships: []
      }
      responsaveis: {
        Row: {
          ativo: boolean
          created_at: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          categoria_id: string | null
          cliente_id: string | null
          created_at: string | null
          data: string
          deletado: boolean
          dependencia: string | null
          forma_pagamento: string
          id: string
          is_recorrente: boolean | null
          nome: string
          observacoes: string | null
          origem: string
          recorrencia: string | null
          recorrencia_ativa: boolean | null
          recorrencia_ocorrencia_atual: number | null
          recorrencia_proxima_data: string | null
          recorrencia_tipo: string | null
          recorrencia_total_ocorrencias: number | null
          recorrencia_transacao_pai_id: string | null
          status: string
          subcategoria_id: string | null
          tipo: string
          updated_at: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data: string
          deletado?: boolean
          dependencia?: string | null
          forma_pagamento: string
          id?: string
          is_recorrente?: boolean | null
          nome: string
          observacoes?: string | null
          origem: string
          recorrencia?: string | null
          recorrencia_ativa?: boolean | null
          recorrencia_ocorrencia_atual?: number | null
          recorrencia_proxima_data?: string | null
          recorrencia_tipo?: string | null
          recorrencia_total_ocorrencias?: number | null
          recorrencia_transacao_pai_id?: string | null
          status: string
          subcategoria_id?: string | null
          tipo: string
          updated_at?: string | null
          user_id?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data?: string
          deletado?: boolean
          dependencia?: string | null
          forma_pagamento?: string
          id?: string
          is_recorrente?: boolean | null
          nome?: string
          observacoes?: string | null
          origem?: string
          recorrencia?: string | null
          recorrencia_ativa?: boolean | null
          recorrencia_ocorrencia_atual?: number | null
          recorrencia_proxima_data?: string | null
          recorrencia_tipo?: string | null
          recorrencia_total_ocorrencias?: number | null
          recorrencia_transacao_pai_id?: string | null
          status?: string
          subcategoria_id?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_recorrencia_transacao_pai_id_fkey"
            columns: ["recorrencia_transacao_pai_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_alertas_caixa: {
        Args: { p_data_fim?: string; p_data_inicio?: string }
        Returns: {
          deficit: number
          proxima_data_vencimento: string
          total_entradas_previstas: number
          total_saidas_previstas: number
          total_vencimentos_proximos: number
          workspace: string
        }[]
      }
      claim_unowned_transactions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      gerar_proximas_transacoes_recorrentes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gerenciar_recorrencia: {
        Args: { p_acao: string; p_transacao_pai_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
