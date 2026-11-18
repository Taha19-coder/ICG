import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          property_type: string;
          purpose: string;
          price: number;
          location: string;
          society: string;
          bedrooms: number;
          bathrooms: number;
          kitchens: number;
          floors: number;
          covered_area: number;
          plot_size: number;
          area_unit: string;
          parking: number;
          furnishing_status: string;
          features: string[];
          nearby_landmarks: string[];
          status: string;
          is_featured: boolean;
          reference_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          alt: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['property_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['property_images']['Insert']>;
      };
      construction_projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          short_description: string;
          location: string;
          status: string;
          progress_percentage: number;
          expected_completion_date: string | null;
          key_features: string[];
          payment_plan: string | null;
          available_units: number;
          total_units: number;
          reference_id: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['construction_projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['construction_projects']['Insert']>;
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          url: string;
          alt: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['project_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['project_images']['Insert']>;
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          inquiry_type: string;
          message: string;
          property_id: string | null;
          project_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inquiries']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inquiries']['Insert']>;
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at: string;
          last_login: string | null;
        };
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at' | 'last_login'>;
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>;
      };
    };
  };
};