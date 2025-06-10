import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export type Database = {
  public: {
    Tables: {
      day_entries: {
        Row: {
          id: string;
          date: string;
          afternoon_checkin: boolean;
          evening_checkin: boolean;
          afternoon_had_drink: boolean;
          evening_had_drink: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          afternoon_checkin?: boolean;
          evening_checkin?: boolean;
          afternoon_had_drink?: boolean;
          evening_had_drink?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          afternoon_checkin?: boolean;
          evening_checkin?: boolean;
          afternoon_had_drink?: boolean;
          evening_had_drink?: boolean;
          updated_at?: string;
        };
      };
      weekly_rewards: {
        Row: {
          id: string;
          week_start: string;
          title: string;
          description: string;
          icon: string;
          color: string;
          unlocked: boolean;
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          week_start: string;
          title: string;
          description: string;
          icon: string;
          color: string;
          unlocked?: boolean;
          unlocked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          week_start?: string;
          title?: string;
          description?: string;
          icon?: string;
          color?: string;
          unlocked?: boolean;
          unlocked_at?: string | null;
        };
      };
    };
  };
};