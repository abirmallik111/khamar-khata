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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      expense_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_goat_map: {
        Row: {
          expense_id: string
          goat_id: string
          id: string
          user_id: string
        }
        Insert: {
          expense_id: string
          goat_id: string
          id?: string
          user_id: string
        }
        Update: {
          expense_id?: string
          goat_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_goat_map_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_goat_map_goat_id_fkey"
            columns: ["goat_id"]
            isOneToOne: false
            referencedRelation: "goats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_goat_map_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          due_amount: number | null
          expense_date: string
          id: string
          note: string | null
          paid_amount: number | null
          payment_status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          due_amount?: number | null
          expense_date: string
          id?: string
          note?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          due_amount?: number | null
          expense_date?: string
          id?: string
          note?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goat_health_records: {
        Row: {
          created_at: string
          goat_id: string
          id: string
          name: string | null
          next_date: string | null
          notes: string | null
          record_date: string
          record_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goat_id: string
          id?: string
          name?: string | null
          next_date?: string | null
          notes?: string | null
          record_date: string
          record_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          goat_id?: string
          id?: string
          name?: string | null
          next_date?: string | null
          notes?: string | null
          record_date?: string
          record_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goat_health_records_goat_id_fkey"
            columns: ["goat_id"]
            isOneToOne: false
            referencedRelation: "goats"
            referencedColumns: ["id"]
          },
        ]
      }
      goat_notes: {
        Row: {
          created_at: string
          goat_id: string
          id: string
          note: string
          note_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goat_id: string
          id?: string
          note: string
          note_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goat_id?: string
          id?: string
          note?: string
          note_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goat_notes_goat_id_fkey"
            columns: ["goat_id"]
            isOneToOne: false
            referencedRelation: "goats"
            referencedColumns: ["id"]
          },
        ]
      }
      goats: {
        Row: {
          breed: string | null
          created_at: string
          gender: string | null
          id: string
          image_url: string | null
          name_or_tag: string
          purchase_date: string
          purchase_price: number
          source: string | null
          status: Database["public"]["Enums"]["goat_status"]
          user_id: string
        }
        Insert: {
          breed?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          image_url?: string | null
          name_or_tag: string
          purchase_date: string
          purchase_price: number
          source?: string | null
          status?: Database["public"]["Enums"]["goat_status"]
          user_id: string
        }
        Update: {
          breed?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          image_url?: string | null
          name_or_tag?: string
          purchase_date?: string
          purchase_price?: number
          source?: string | null
          status?: Database["public"]["Enums"]["goat_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_contributions: {
        Row: {
          amount: number
          created_at: string
          expense_id: string | null
          goat_id: string | null
          id: string
          owner_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expense_id?: string | null
          goat_id?: string | null
          id?: string
          owner_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string | null
          goat_id?: string | null
          id?: string
          owner_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_contributions_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_contributions_goat_id_fkey"
            columns: ["goat_id"]
            isOneToOne: false
            referencedRelation: "goats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_contributions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          created_at: string
          id: string
          name: string
          share_percentage: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          share_percentage: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          share_percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          goat_id: string
          id: string
          note: string | null
          sale_date: string
          sale_price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          goat_id: string
          id?: string
          note?: string | null
          sale_date: string
          sale_price: number
          user_id: string
        }
        Update: {
          created_at?: string
          goat_id?: string
          id?: string
          note?: string | null
          sale_date?: string
          sale_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_goat_id_fkey"
            columns: ["goat_id"]
            isOneToOne: true
            referencedRelation: "goats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_expense_with_mappings: {
        Args: {
          p_amount: number
          p_category_id: string
          p_due_amount: number
          p_expense_date: string
          p_goat_ids: string[]
          p_note: string
          p_owner_contributions: Json
          p_paid_amount: number
          p_payment_status: string
          p_user_id: string
        }
        Returns: string
      }
      add_goat_with_contributions: {
        Args: {
          p_breed: string
          p_gender: string
          p_image_url: string
          p_name_or_tag: string
          p_owner_contributions: Json
          p_purchase_date: string
          p_purchase_price: number
          p_source: string
          p_user_id: string
        }
        Returns: string
      }
      add_sale_and_update_goat: {
        Args: {
          p_goat_id: string
          p_note: string
          p_sale_date: string
          p_sale_price: number
          p_user_id: string
        }
        Returns: undefined
      }
      delete_sale_and_revert_goat: {
        Args: { p_sale_id: string; p_user_id: string }
        Returns: undefined
      }
      get_farm_reports: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      restore_user_data: { Args: { backup_data: Json }; Returns: undefined }
      update_expense_with_mappings: {
        Args: {
          p_amount: number
          p_category_id: string
          p_due_amount: number
          p_expense_date: string
          p_expense_id: string
          p_goat_ids: string[]
          p_note: string
          p_owner_contributions: Json
          p_paid_amount: number
          p_payment_status: string
          p_user_id: string
        }
        Returns: undefined
      }
      update_goat_with_contributions: {
        Args: {
          p_breed: string
          p_gender: string
          p_goat_id: string
          p_image_url: string
          p_name_or_tag: string
          p_owner_contributions: Json
          p_purchase_date: string
          p_purchase_price: number
          p_source: string
          p_status: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      goat_status: "active" | "sold" | "sick" | "dead" | "archived"
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
      goat_status: ["active", "sold", "sick", "dead", "archived"],
    },
  },
} as const
