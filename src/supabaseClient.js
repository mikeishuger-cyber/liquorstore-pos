import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yiksjublkjkydvzgtkmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpa3NqdWJsa2preWR2emd0a21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MDIwMTcsImV4cCI6MjA4MzA3ODAxN30.1id50HnjUsAPtXbIj_OVQfz76cqXjNJ_mwQEFOhb2iU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);