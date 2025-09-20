// Data Service for BoQ System (Supabase Implementation)
import { supabaseDb } from './supabase-data';

// Re-export Supabase service as default database
export const db = supabaseDb;
