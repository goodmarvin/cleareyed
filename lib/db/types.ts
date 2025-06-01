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
      matches: {
        Row: {
          created_at: string | null
          id: string
          model_id: string
          query_id: string
          rerank_score: number | null
          similarity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          model_id: string
          query_id: string
          rerank_score?: number | null
          similarity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          model_id?: string
          query_id?: string
          rerank_score?: number | null
          similarity?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "mental_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "query_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_models: {
        Row: {
          body_md: string
          created_at: string | null
          embedding: string
          id: string
          name: string
          tags: Json
          updated_at: string | null
          concept_embedding: string | null
          application_embedding: string | null
          concept_description: string | null
          application_description: string | null
        }
        Insert: {
          body_md: string
          created_at?: string | null
          embedding: string
          id?: string
          name: string
          tags?: Json
          updated_at?: string | null
          concept_embedding?: string | null
          application_embedding?: string | null
          concept_description?: string | null
          application_description?: string | null
        }
        Update: {
          body_md?: string
          created_at?: string | null
          embedding?: string
          id?: string
          name?: string
          tags?: Json
          updated_at?: string | null
          concept_embedding?: string | null
          application_embedding?: string | null
          concept_description?: string | null
          application_description?: string | null
        }
        Relationships: []
      }
      queries: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          id: string
          intent: Json | null
          plan_b_count: number | null
          prompt: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          intent?: Json | null
          plan_b_count?: number | null
          prompt: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          intent?: Json | null
          plan_b_count?: number | null
          prompt?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          match_id: string
          stars: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          match_id: string
          stars: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          match_id?: string
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      model_popularity: {
        Row: {
          avg_rating: number | null
          created_at: string | null
          id: string | null
          match_count: number | null
          name: string | null
          rating_count: number | null
          tags: Json | null
        }
        Relationships: []
      }
      query_analytics: {
        Row: {
          avg_rating: number | null
          created_at: string | null
          duration_ms: number | null
          id: string | null
          intent: Json | null
          match_count: number | null
          plan_b_count: number | null
          prompt: string | null
          rating_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      match_mental_models: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: Array<{
          id: string
          name: string
          body_md: string
          tags: Json
          embedding: string
          created_at: string | null
          updated_at: string | null
          similarity: number
        }>
      }
      match_mental_models_by_application: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: Array<{
          id: string
          name: string
          body_md: string
          tags: Json
          embedding: string
          concept_description: string
          application_description: string
          concept_embedding: string
          application_embedding: string
          created_at: string | null
          updated_at: string | null
          similarity: number
        }>
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

// Convenient type aliases for our specific tables
export type MentalModel = Tables<'mental_models'>
export type Query = Tables<'queries'>
export type Match = Tables<'matches'>
export type Rating = Tables<'ratings'>

export type MentalModelInsert = TablesInsert<'mental_models'>
export type QueryInsert = TablesInsert<'queries'>
export type MatchInsert = TablesInsert<'matches'>
export type RatingInsert = TablesInsert<'ratings'> 