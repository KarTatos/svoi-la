export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      places: {
        Row: {
          id: string;
          created_at: string | null;
          name: string;
          category: string;
          district: string;
          address: string | null;
          tip: string;
          rating: number | null;
          added_by: string;
          user_id: string | null;
          img: string | null;
          photos: string[] | null;
          likes_count: number | null;
          views: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["places"]["Row"]> & {
          name: string;
          category: string;
          district: string;
          tip: string;
          added_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["places"]["Row"]>;
      };
      tips: {
        Row: {
          id: string;
          created_at: string | null;
          category: string;
          title: string;
          text: string;
          author: string | null;
          user_id: string | null;
          likes_count: number | null;
          views: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["tips"]["Row"]> & {
          category: string;
          title: string;
          text: string;
        };
        Update: Partial<Database["public"]["Tables"]["tips"]["Row"]>;
      };
      events: {
        Row: {
          id: string;
          created_at: string | null;
          category: string;
          title: string;
          date: string;
          location: string | null;
          description: string;
          author: string | null;
          user_id: string | null;
          likes_count: number | null;
          views: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          category: string;
          title: string;
          date: string;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
      };
      housing: {
        Row: {
          id: string;
          created_at: string | null;
          user_id: string | null;
          title: string;
          address: string;
          district: string;
          type: string;
          min_price: number;
          price_options: string[] | null;
          beds: number | null;
          baths: number | null;
          updated_label: string | null;
          tags: string[] | null;
          photo: string | null;
          likes_count: number | null;
          views: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["housing"]["Row"]> & {
          title: string;
          address: string;
        };
        Update: Partial<Database["public"]["Tables"]["housing"]["Row"]>;
      };
      comments: {
        Row: {
          id: string;
          created_at: string | null;
          item_id: string;
          item_type: string;
          user_id: string | null;
          author: string;
          text: string;
        };
        Insert: Partial<Database["public"]["Tables"]["comments"]["Row"]> & {
          item_id: string;
          item_type: string;
          author: string;
          text: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
      };
      likes: {
        Row: {
          id: string;
          created_at: string | null;
          item_id: string;
          item_type: string;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["likes"]["Row"]> & {
          item_id: string;
          item_type: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["likes"]["Row"]>;
      };
      card_views: {
        Row: {
          id: number;
          item_type: string;
          item_id: string;
          viewer_key: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["card_views"]["Row"]> & {
          item_type: string;
          item_id: string;
          viewer_key: string;
        };
        Update: Partial<Database["public"]["Tables"]["card_views"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

