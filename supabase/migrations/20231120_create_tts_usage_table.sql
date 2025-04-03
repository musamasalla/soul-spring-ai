-- Create table for tracking OpenAI TTS API usage
CREATE TABLE IF NOT EXISTS tts_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  characters INTEGER NOT NULL,
  model TEXT NOT NULL,
  voice TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID,
  content_snippet TEXT
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_tts_usage_user_id ON tts_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tts_usage_timestamp ON tts_usage(timestamp);

-- Create RLS policies
ALTER TABLE tts_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view their own TTS usage"
  ON tts_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert records
CREATE POLICY "Users can insert their own TTS usage"
  ON tts_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service role can delete records (instead of checking for admin users)
CREATE POLICY "Only service role can delete TTS usage"
  ON tts_usage FOR DELETE
  USING (false); -- Default deny for delete through RLS

-- Create view for usage analytics
CREATE OR REPLACE VIEW tts_usage_statistics AS
SELECT 
  user_id,
  DATE_TRUNC('day', timestamp) as day,
  COUNT(*) as total_requests,
  SUM(characters) as total_characters,
  AVG(characters) as avg_length
FROM tts_usage
GROUP BY user_id, day
ORDER BY day DESC;

-- Create function to get monthly user usage
CREATE OR REPLACE FUNCTION get_monthly_tts_usage(user_uuid UUID)
RETURNS TABLE (
  month TEXT,
  total_requests BIGINT,
  total_characters BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    TO_CHAR(DATE_TRUNC('month', timestamp), 'Month YYYY') as month,
    COUNT(*) as total_requests,
    SUM(characters) as total_characters
  FROM tts_usage
  WHERE user_id = user_uuid
  GROUP BY DATE_TRUNC('month', timestamp)
  ORDER BY DATE_TRUNC('month', timestamp) DESC;
$$; 