import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://tqkuwuaejndsaxlcmvfx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxa3V3dWFlam5kc2F4bGNtdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3NzcxMTksImV4cCI6MjA1MDM1MzExOX0.FsXaU08KgIjlQ_HAUL-mt3AlSJspy1GKcto8XNE0GeY";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;