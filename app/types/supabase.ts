export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
          role: string | null;
        };
        Insert: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          role?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          owner_id: string;
          property_type: string;
          bedrooms: number | null;
          bathrooms: number | null;
          square_feet: number | null;
          description: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          owner_id: string;
          property_type: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          description?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          owner_id?: string;
          property_type?: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          description?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'properties_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
