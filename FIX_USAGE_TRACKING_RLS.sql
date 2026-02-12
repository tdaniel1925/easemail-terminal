-- Fix Missing usage_tracking Table RLS Policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own usage tracking" ON usage_tracking;
DROP POLICY IF EXISTS "Users can insert own usage tracking" ON usage_tracking;

-- Users can view their own usage tracking
CREATE POLICY "Users can view own usage tracking"
ON usage_tracking FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own usage tracking
CREATE POLICY "Users can insert own usage tracking"
ON usage_tracking FOR INSERT
WITH CHECK (user_id = auth.uid());

-- SUCCESS
SELECT 'usage_tracking RLS policies restored!' AS status;
