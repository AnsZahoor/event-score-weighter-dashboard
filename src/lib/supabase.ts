
import { createClient } from '@supabase/supabase-js';
import { RawEvent } from '../types/event';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Type for the events table in Supabase
export interface SupabaseEvent extends RawEvent {
  created_at?: string;
  user_id?: string;
}

// Authentication functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// Event database functions
export const fetchEventsFromSupabase = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error("Error fetching events from Supabase:", error);
    throw error;
  }

  return data as RawEvent[];
};

export const insertEvent = async (event: RawEvent) => {
  const { error } = await supabase
    .from('events')
    .insert(event);
  
  if (error) {
    console.error("Error inserting event:", error);
    throw error;
  }
  
  return true;
};

export const seedInitialEvents = async (events: RawEvent[]) => {
  // Check if events already exist
  const { data, error } = await supabase
    .from('events')
    .select('count')
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error("Error checking events count:", error);
    return false;
  }
  
  // If no events or empty table, insert seed data
  if (!data || data.count === 0) {
    const { error: insertError } = await supabase
      .from('events')
      .insert(events);
    
    if (insertError) {
      console.error("Error seeding events:", insertError);
      return false;
    }
    
    console.log("Initial events seeded successfully");
    return true;
  }
  
  console.log("Events already exist, skipping seed");
  return true;
};
