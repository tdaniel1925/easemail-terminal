-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_deliveries table for logging
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_webhooks_organization_id ON webhooks(organization_id);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Add RLS policies
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Webhooks policies
CREATE POLICY "Organization admins can view webhooks"
  ON webhooks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = webhooks.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Organization admins can create webhooks"
  ON webhooks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = webhooks.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Organization admins can update webhooks"
  ON webhooks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = webhooks.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Organization admins can delete webhooks"
  ON webhooks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = webhooks.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('OWNER', 'ADMIN')
    )
  );

-- Webhook deliveries policies
CREATE POLICY "Organization admins can view webhook deliveries"
  ON webhook_deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhooks
      JOIN organization_members ON organization_members.organization_id = webhooks.organization_id
      WHERE webhooks.id = webhook_deliveries.webhook_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('OWNER', 'ADMIN')
    )
  );

-- Add comments
COMMENT ON TABLE webhooks IS 'Webhook configurations for organization event notifications';
COMMENT ON TABLE webhook_deliveries IS 'Webhook delivery attempts and logs';
COMMENT ON COLUMN webhooks.events IS 'Array of event types this webhook subscribes to';
COMMENT ON COLUMN webhooks.secret IS 'Secret key for signing webhook payloads';
COMMENT ON COLUMN webhook_deliveries.retry_count IS 'Number of delivery retry attempts';
COMMENT ON COLUMN webhook_deliveries.next_retry_at IS 'Scheduled time for next retry attempt';
