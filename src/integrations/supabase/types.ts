export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          birthday: string | null
          created_at: string
          email: string
          id: string
          join_date: string
          location: string | null
          monthly_count: number
          name: string
          package: string
          payment_type: string | null
          phone: string
          price: number | null
          regular_slot: string | null
          sessions_left: number
          total_sessions: number
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          email: string
          id?: string
          join_date?: string
          location?: string | null
          monthly_count?: number
          name: string
          package: string
          payment_type?: string | null
          phone: string
          price?: number | null
          regular_slot?: string | null
          sessions_left?: number
          total_sessions?: number
        }
        Update: {
          birthday?: string | null
          created_at?: string
          email?: string
          id?: string
          join_date?: string
          location?: string | null
          monthly_count?: number
          name?: string
          package?: string
          payment_type?: string | null
          phone?: string
          price?: number | null
          regular_slot?: string | null
          sessions_left?: number
          total_sessions?: number
        }
        Relationships: []
      }
      package_purchases: {
        Row: {
          amount: number
          client_id: string
          client_name: string
          created_at: string
          id: string
          notes: string | null
          package_name: string
          package_sessions: number
          payment_status: string
          payment_type: string
          purchase_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          client_name: string
          created_at?: string
          id?: string
          notes?: string | null
          package_name: string
          package_sessions: number
          payment_status?: string
          payment_type?: string
          purchase_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          client_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          package_name?: string
          package_sessions?: number
          payment_status?: string
          payment_type?: string
          purchase_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_purchases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          client_name: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_status: string
          payment_type: string
          session_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          client_name: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string
          payment_type: string
          session_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          client_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string
          payment_type?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_id: string
          client_name: string
          created_at: string
          date: string
          duration: number
          id: string
          location: string | null
          package: string
          payment_status: string | null
          payment_type: string | null
          status: string
          time: string
        }
        Insert: {
          client_id: string
          client_name: string
          created_at?: string
          date: string
          duration?: number
          id?: string
          location?: string | null
          package: string
          payment_status?: string | null
          payment_type?: string | null
          status?: string
          time: string
        }
        Update: {
          client_id?: string
          client_name?: string
          created_at?: string
          date?: string
          duration?: number
          id?: string
          location?: string | null
          package?: string
          payment_status?: string | null
          payment_type?: string | null
          status?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
