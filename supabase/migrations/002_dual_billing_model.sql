-- Migration: Add dual billing model support
-- Individual users can have their own subscriptions OR be part of organizations
-- Users cannot be both (mutual exclusivity enforced)

-- Add individual billing fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status TEXT; -- 'active', 'trialing', 'canceled', 'past_due'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_beta_user BOOLEAN DEFAULT TRUE; -- Everyone starts as beta user

-- Add trial fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;

-- Add beta mode flag (system-wide setting)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Set initial beta mode to TRUE
INSERT INTO system_settings (key, value)
VALUES ('beta_mode', '{"enabled": true, "disabled_at": null}'::JSONB)
ON CONFLICT (key) DO NOTHING;

-- Function to check if user can have individual subscription
-- Returns FALSE if user is a member of any organization
CREATE OR REPLACE FUNCTION can_have_individual_subscription(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  org_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO org_count
  FROM organization_members
  WHERE user_id = user_id_param;

  RETURN org_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is in beta mode
CREATE OR REPLACE FUNCTION is_beta_user(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  beta_mode_enabled BOOLEAN;
  user_is_beta BOOLEAN;
BEGIN
  -- Check system-wide beta mode
  SELECT (value->>'enabled')::BOOLEAN INTO beta_mode_enabled
  FROM system_settings
  WHERE key = 'beta_mode';

  -- If system is in beta, everyone is beta user
  IF beta_mode_enabled THEN
    RETURN TRUE;
  END IF;

  -- Otherwise check user's beta flag
  SELECT is_beta_user INTO user_is_beta
  FROM public.users
  WHERE id = user_id_param;

  RETURN COALESCE(user_is_beta, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to check if billing should be enforced
CREATE OR REPLACE FUNCTION should_enforce_billing()
RETURNS BOOLEAN AS $$
DECLARE
  beta_mode_enabled BOOLEAN;
BEGIN
  SELECT (value->>'enabled')::BOOLEAN INTO beta_mode_enabled
  FROM system_settings
  WHERE key = 'beta_mode';

  -- Don't enforce billing during beta
  RETURN NOT COALESCE(beta_mode_enabled, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to get user's subscription context
-- Returns 'individual', 'organization', 'none', or 'beta'
CREATE OR REPLACE FUNCTION get_subscription_context(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  org_count INTEGER;
  has_individual_sub BOOLEAN;
  user_is_beta BOOLEAN;
BEGIN
  -- Check if in beta mode
  SELECT is_beta_user(user_id_param) INTO user_is_beta;
  IF user_is_beta THEN
    RETURN 'beta';
  END IF;

  -- Check organization membership
  SELECT COUNT(*) INTO org_count
  FROM organization_members
  WHERE user_id = user_id_param;

  IF org_count > 0 THEN
    RETURN 'organization';
  END IF;

  -- Check individual subscription
  SELECT stripe_subscription_id IS NOT NULL INTO has_individual_sub
  FROM public.users
  WHERE id = user_id_param;

  IF has_individual_sub THEN
    RETURN 'individual';
  END IF;

  RETURN 'none';
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent dual subscriptions
-- When user joins an organization, cancel their individual subscription
CREATE OR REPLACE FUNCTION prevent_dual_subscription()
RETURNS TRIGGER AS $$
DECLARE
  user_sub_id TEXT;
BEGIN
  -- Get user's individual subscription ID
  SELECT stripe_subscription_id INTO user_sub_id
  FROM public.users
  WHERE id = NEW.user_id;

  -- If user has individual subscription, mark it for cancellation
  IF user_sub_id IS NOT NULL THEN
    UPDATE public.users
    SET
      subscription_status = 'pending_cancellation',
      updated_at = NOW()
    WHERE id = NEW.user_id;

    -- Note: Actual Stripe API call to cancel subscription should happen
    -- in application code, not in trigger. This just marks it.
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_dual_subscription_trigger
  BEFORE INSERT ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION prevent_dual_subscription();

-- Function to auto-upgrade organization subscription when seats exceeded
CREATE OR REPLACE FUNCTION check_and_upgrade_organization_seats()
RETURNS TRIGGER AS $$
DECLARE
  current_seats INTEGER;
  seats_used INTEGER;
BEGIN
  -- Get organization's current seat limit
  SELECT seats INTO current_seats
  FROM organizations
  WHERE id = NEW.organization_id;

  -- Count how many seats are now used
  SELECT COUNT(*) INTO seats_used
  FROM organization_members
  WHERE organization_id = NEW.organization_id;

  -- If exceeded, update seats to match usage
  IF seats_used > current_seats THEN
    UPDATE organizations
    SET
      seats = seats_used,
      seats_used = seats_used,
      updated_at = NOW()
    WHERE id = NEW.organization_id;

    -- Note: Actual Stripe subscription update should happen in application code
    -- This trigger just updates the database to reflect the change
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_upgrade_seats_trigger
  AFTER INSERT ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION check_and_upgrade_organization_seats();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status) WHERE subscription_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_trial_ends ON public.users(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orgs_trial_ends ON organizations(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

-- Add RLS policies for individual subscriptions
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own billing info
CREATE POLICY users_read_own_billing ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own non-billing fields
-- (billing fields should only be updated by service role)
CREATE POLICY users_update_own_profile ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMENT ON TABLE system_settings IS 'System-wide settings including beta mode';
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for individual subscription';
COMMENT ON COLUMN public.users.stripe_subscription_id IS 'Stripe subscription ID for individual subscription';
COMMENT ON COLUMN public.users.subscription_status IS 'Status: active, trialing, canceled, past_due, pending_cancellation';
COMMENT ON COLUMN public.users.is_beta_user IS 'User is in beta program (no billing)';
COMMENT ON FUNCTION can_have_individual_subscription IS 'Returns TRUE if user is not a member of any organization';
COMMENT ON FUNCTION get_subscription_context IS 'Returns: beta, individual, organization, or none';
COMMENT ON FUNCTION should_enforce_billing IS 'Returns FALSE during beta mode';
