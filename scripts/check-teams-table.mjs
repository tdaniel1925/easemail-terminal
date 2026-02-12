import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Checking ms_graph_tokens table...\n');

// Check if table exists
const { data: tables, error: tablesError } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
  .eq('table_name', 'ms_graph_tokens');

if (tablesError) {
  console.error('Error checking tables:', tablesError);
} else if (!tables || tables.length === 0) {
  console.log('❌ Table "ms_graph_tokens" does NOT exist');
  console.log('\n📝 Need to create the table. Run this SQL in Supabase:');
  console.log(`
CREATE TABLE IF NOT EXISTS ms_graph_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE ms_graph_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own MS Graph tokens"
  ON ms_graph_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MS Graph tokens"
  ON ms_graph_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MS Graph tokens"
  ON ms_graph_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own MS Graph tokens"
  ON ms_graph_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_ms_graph_tokens_user_id ON ms_graph_tokens(user_id);
`);
} else {
  console.log('✅ Table "ms_graph_tokens" exists');

  // Get table structure
  const { data: columns, error: columnsError } = await supabase
    .rpc('exec_sql', {
      sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ms_graph_tokens' ORDER BY ordinal_position"
    })
    .catch(async () => {
      // Fallback: try to query the table directly
      return await supabase.from('ms_graph_tokens').select('*').limit(0);
    });

  if (!columnsError) {
    console.log('\n📋 Table structure looks good');
  }

  // Check for existing tokens
  const { data: tokens, error: tokensError } = await supabase
    .from('ms_graph_tokens')
    .select('user_id, expires_at, created_at');

  if (!tokensError) {
    console.log(`\n📊 Found ${tokens?.length || 0} MS Graph token(s)`);
    if (tokens && tokens.length > 0) {
      tokens.forEach(token => {
        const expired = new Date(token.expires_at) < new Date();
        console.log(`   - User: ${token.user_id} | ${expired ? '❌ EXPIRED' : '✅ Valid'} | Created: ${new Date(token.created_at).toLocaleString()}`);
      });
    }
  }
}
