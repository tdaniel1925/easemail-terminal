-- Webhook events table for storing and processing Nylas webhooks
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,
  grant_id TEXT NOT NULL,
  object_id TEXT NOT NULL,
  payload JSONB NOT NULL,

  processed BOOLEAN DEFAULT FALSE NOT NULL,
  processed_at TIMESTAMPTZ,
  error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for faster lookups
CREATE INDEX idx_webhook_events_user ON webhook_events(user_id, processed, created_at DESC);
CREATE INDEX idx_webhook_events_grant ON webhook_events(grant_id, event_type);
CREATE INDEX idx_webhook_events_object ON webhook_events(object_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, created_at);

-- RLS policies
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhook events" ON webhook_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert webhook events" ON webhook_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update webhook events" ON webhook_events
  FOR UPDATE USING (true);

-- Add email_received feature type for tracking
ALTER TYPE feature_type ADD VALUE IF NOT EXISTS 'email_received';
