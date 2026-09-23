import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stmcdorfzhowjceaurrb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bWNkb3Jmemhvd2pjZWF1cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDU0MjIsImV4cCI6MjEwNTY4MTQyMn0.sDYX0BBZqdSjnvXX3lC6GEnfKtI9xoVQGeizCnj4zVk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
