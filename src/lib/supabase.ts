
// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Use the URL and key from the integrations file
// Hardcoded values are coming from src/integrations/supabase/client.ts
const supabaseUrl = "https://srokpawueetpgclmoehg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyb2twYXd1ZWV0cGdjbG1vZWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTE4ODYsImV4cCI6MjA1OTg4Nzg4Nn0.8aJ8dPHat_rs9A1c1gb33dAb9uQblnd0ii29lcVXcns";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
