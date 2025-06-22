const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vqnhqpuhklyvwoqrujip.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbmhxcHVoa2x5dndvcXJ1amlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIwMjE4MywiZXhwIjoyMDY1Nzc4MTgzfQ.D8gpAkNuCn4ilN7cNpckJRceRKxPhzdklyQ7QFj99uE';
    
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase };