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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assinantes: {
        Row: {
          assinatura_fim: string | null
          assinatura_inicio: string | null
          created_at: string
          crmv: string | null
          email: string | null
          id: string
          nome: string
          plano_id: string | null
          status: string
          telefone: string | null
        }
        Insert: {
          assinatura_fim?: string | null
          assinatura_inicio?: string | null
          created_at?: string
          crmv?: string | null
          email?: string | null
          id?: string
          nome: string
          plano_id?: string | null
          status?: string
          telefone?: string | null
        }
        Update: {
          assinatura_fim?: string | null
          assinatura_inicio?: string | null
          created_at?: string
          crmv?: string | null
          email?: string | null
          id?: string
          nome?: string
          plano_id?: string | null
          status?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assinantes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      internacao_registros: {
        Row: {
          created_at: string
          hora: string | null
          id: string
          internacao_id: string
          notas: string | null
          tipo: string
          valor: string | null
        }
        Insert: {
          created_at?: string
          hora?: string | null
          id?: string
          internacao_id: string
          notas?: string | null
          tipo: string
          valor?: string | null
        }
        Update: {
          created_at?: string
          hora?: string | null
          id?: string
          internacao_id?: string
          notas?: string | null
          tipo?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internacao_registros_internacao_id_fkey"
            columns: ["internacao_id"]
            isOneToOne: false
            referencedRelation: "internacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      internacoes: {
        Row: {
          animal_especie: string | null
          animal_idade: string | null
          animal_microchip: string | null
          animal_nome: string | null
          animal_peso: number | null
          animal_raca: string | null
          created_at: string
          data_internacao: string | null
          foto: string | null
          id: string
          motivo: string | null
          status: string
          tutor_cpf: string | null
          tutor_nome: string | null
          tutor_telefone: string | null
        }
        Insert: {
          animal_especie?: string | null
          animal_idade?: string | null
          animal_microchip?: string | null
          animal_nome?: string | null
          animal_peso?: number | null
          animal_raca?: string | null
          created_at?: string
          data_internacao?: string | null
          foto?: string | null
          id?: string
          motivo?: string | null
          status?: string
          tutor_cpf?: string | null
          tutor_nome?: string | null
          tutor_telefone?: string | null
        }
        Update: {
          animal_especie?: string | null
          animal_idade?: string | null
          animal_microchip?: string | null
          animal_nome?: string | null
          animal_peso?: number | null
          animal_raca?: string | null
          created_at?: string
          data_internacao?: string | null
          foto?: string | null
          id?: string
          motivo?: string | null
          status?: string
          tutor_cpf?: string | null
          tutor_nome?: string | null
          tutor_telefone?: string | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          alergias: string | null
          castrado: boolean | null
          created_at: string
          doenca_cronica: string | null
          especie: string | null
          foto: string | null
          id: string
          idade: string | null
          microchip: string | null
          nome: string
          pelagem: string | null
          peso: number | null
          porte: string | null
          raca: string | null
          sexo: string | null
          tutor_id: string
        }
        Insert: {
          alergias?: string | null
          castrado?: boolean | null
          created_at?: string
          doenca_cronica?: string | null
          especie?: string | null
          foto?: string | null
          id?: string
          idade?: string | null
          microchip?: string | null
          nome: string
          pelagem?: string | null
          peso?: number | null
          porte?: string | null
          raca?: string | null
          sexo?: string | null
          tutor_id: string
        }
        Update: {
          alergias?: string | null
          castrado?: boolean | null
          created_at?: string
          doenca_cronica?: string | null
          especie?: string | null
          foto?: string | null
          id?: string
          idade?: string | null
          microchip?: string | null
          nome?: string
          pelagem?: string | null
          peso?: number | null
          porte?: string | null
          raca?: string | null
          sexo?: string | null
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          duracao_dias: number
          id: string
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao_dias?: number
          id?: string
          nome: string
          preco?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao_dias?: number
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          animal_alergias: string | null
          animal_castrado: boolean | null
          animal_doenca_cronica: string | null
          animal_especie: string | null
          animal_idade: string | null
          animal_microchip: string | null
          animal_nome: string | null
          animal_pelagem: string | null
          animal_peso: number | null
          animal_porte: string | null
          animal_raca: string | null
          animal_sexo: string | null
          comportamento: string[] | null
          created_at: string
          data_atendimento: string | null
          exames_solicitados: string[] | null
          frequencia_cardiaca: number | null
          frequencia_respiratoria: number | null
          historico_doenca: string | null
          id: string
          medicamentos: string[] | null
          mucosas: string | null
          numero_prontuario: string
          observacoes_gerais: string | null
          palpacao_abdominal: string | null
          queixa_principal: string | null
          recomendacoes: string | null
          sintomas: string[] | null
          status: string
          suspeita_diagnostica: string | null
          temperatura: number | null
          tratamento_prescrito: string | null
          tutor_cpf: string | null
          tutor_email: string | null
          tutor_endereco: string | null
          tutor_nome: string | null
          tutor_telefone: string | null
        }
        Insert: {
          animal_alergias?: string | null
          animal_castrado?: boolean | null
          animal_doenca_cronica?: string | null
          animal_especie?: string | null
          animal_idade?: string | null
          animal_microchip?: string | null
          animal_nome?: string | null
          animal_pelagem?: string | null
          animal_peso?: number | null
          animal_porte?: string | null
          animal_raca?: string | null
          animal_sexo?: string | null
          comportamento?: string[] | null
          created_at?: string
          data_atendimento?: string | null
          exames_solicitados?: string[] | null
          frequencia_cardiaca?: number | null
          frequencia_respiratoria?: number | null
          historico_doenca?: string | null
          id?: string
          medicamentos?: string[] | null
          mucosas?: string | null
          numero_prontuario: string
          observacoes_gerais?: string | null
          palpacao_abdominal?: string | null
          queixa_principal?: string | null
          recomendacoes?: string | null
          sintomas?: string[] | null
          status?: string
          suspeita_diagnostica?: string | null
          temperatura?: number | null
          tratamento_prescrito?: string | null
          tutor_cpf?: string | null
          tutor_email?: string | null
          tutor_endereco?: string | null
          tutor_nome?: string | null
          tutor_telefone?: string | null
        }
        Update: {
          animal_alergias?: string | null
          animal_castrado?: boolean | null
          animal_doenca_cronica?: string | null
          animal_especie?: string | null
          animal_idade?: string | null
          animal_microchip?: string | null
          animal_nome?: string | null
          animal_pelagem?: string | null
          animal_peso?: number | null
          animal_porte?: string | null
          animal_raca?: string | null
          animal_sexo?: string | null
          comportamento?: string[] | null
          created_at?: string
          data_atendimento?: string | null
          exames_solicitados?: string[] | null
          frequencia_cardiaca?: number | null
          frequencia_respiratoria?: number | null
          historico_doenca?: string | null
          id?: string
          medicamentos?: string[] | null
          mucosas?: string | null
          numero_prontuario?: string
          observacoes_gerais?: string | null
          palpacao_abdominal?: string | null
          queixa_principal?: string | null
          recomendacoes?: string | null
          sintomas?: string[] | null
          status?: string
          suspeita_diagnostica?: string | null
          temperatura?: number | null
          tratamento_prescrito?: string | null
          tutor_cpf?: string | null
          tutor_email?: string | null
          tutor_endereco?: string | null
          tutor_nome?: string | null
          tutor_telefone?: string | null
        }
        Relationships: []
      }
      tutores: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "veterinario"
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
    Enums: {
      app_role: ["admin", "veterinario"],
    },
  },
} as const
