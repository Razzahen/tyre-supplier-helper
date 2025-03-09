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
      margin_configs: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          margin_type: string
          margin_value: number
          priority: number
          tyre_model_id: string | null
          tyre_size_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          margin_type: string
          margin_value: number
          priority?: number
          tyre_model_id?: string | null
          tyre_size_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          margin_type?: string
          margin_value?: number
          priority?: number
          tyre_model_id?: string | null
          tyre_size_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "margin_configs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "tyre_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "margin_configs_tyre_model_id_fkey"
            columns: ["tyre_model_id"]
            isOneToOne: false
            referencedRelation: "tyre_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "margin_configs_tyre_size_id_fkey"
            columns: ["tyre_size_id"]
            isOneToOne: false
            referencedRelation: "tyre_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tyre_brands: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tyre_models: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tyre_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "tyre_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      tyre_prices: {
        Row: {
          brand_id: string
          cost: number
          created_at: string
          id: string
          supplier_id: string
          tyre_model_id: string
          tyre_size_id: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          cost: number
          created_at?: string
          id?: string
          supplier_id: string
          tyre_model_id: string
          tyre_size_id: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          cost?: number
          created_at?: string
          id?: string
          supplier_id?: string
          tyre_model_id?: string
          tyre_size_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tyre_prices_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "tyre_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tyre_prices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tyre_prices_tyre_model_id_fkey"
            columns: ["tyre_model_id"]
            isOneToOne: false
            referencedRelation: "tyre_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tyre_prices_tyre_size_id_fkey"
            columns: ["tyre_size_id"]
            isOneToOne: false
            referencedRelation: "tyre_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      tyre_sizes: {
        Row: {
          aspect_ratio: number
          created_at: string
          diameter: number
          id: string
          size: string
          width: number
        }
        Insert: {
          aspect_ratio: number
          created_at?: string
          diameter: number
          id?: string
          size: string
          width: number
        }
        Update: {
          aspect_ratio?: number
          created_at?: string
          diameter?: number
          id?: string
          size?: string
          width?: number
        }
        Relationships: []
      }
    }
    Views: {
      tyre_search_results: {
        Row: {
          brand: string | null
          cost: number | null
          id: string | null
          margin_type: string | null
          margin_value: number | null
          model: string | null
          sell_price: number | null
          size: string | null
          supplier: string | null
          user_id: string | null
        }
        Relationships: []
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
