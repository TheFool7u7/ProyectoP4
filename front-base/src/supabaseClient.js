import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqnhqpuhklyvwoqrujip.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbmhxcHVoa2x5dndvcXJ1amlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDIxODMsImV4cCI6MjA2NTc3ODE4M30.xLDWgxOh7YebQ5ucUQn9AwQtNmgSOk7oDeGJoiW0930'; // OJO: Usa la llave ANON (pública)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);