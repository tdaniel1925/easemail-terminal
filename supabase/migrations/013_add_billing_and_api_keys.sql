-- Migration: Add API keys, billing, invoices, and enterprise management
-- Description: Complete billing infrastructure for multi-tenant SaaS

-- ================================================
-- API KEYS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_value TEXT NOT NULL, -- Encrypted OpenAI API key
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,

    CONSTRAINT unique_org_key_name UNIQUE(organization_id, key_name)
);

-- Index for fast lookups
CREATE INDEX idx_api_keys_org ON public.api_keys(organization_id);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Organization admins can view and manage their API keys
CREATE POLICY "Org admins can view API keys"
    ON public.api_keys FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Org admins can insert API keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Org admins can update API keys"
    ON public.api_keys FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Org admins can delete API keys"
    ON public.api_keys FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

-- Super admins can do everything
CREATE POLICY "Super admins full access to API keys"
    ON public.api_keys FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_super_admin = true
        )
    );

-- ================================================
-- PAYMENT METHODS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT, -- For cards/ACH via Stripe
    type TEXT NOT NULL CHECK (type IN ('card', 'ach', 'invoice')),
    is_default BOOLEAN DEFAULT false,

    -- Card details (masked for display)
    card_brand TEXT,
    card_last4 TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,

    -- ACH details (masked)
    bank_name TEXT,
    bank_last4 TEXT,

    -- Invoice details
    invoice_email TEXT,
    invoice_address TEXT,
    invoice_po_number TEXT,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT unique_org_default_payment UNIQUE(organization_id, is_default) WHERE is_default = true
);

CREATE INDEX idx_payment_methods_org ON public.payment_methods(organization_id);
CREATE INDEX idx_payment_methods_default ON public.payment_methods(organization_id, is_default) WHERE is_default = true;

-- RLS Policies
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view payment methods"
    ON public.payment_methods FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Org admins can manage payment methods"
    ON public.payment_methods FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Super admins full access to payment methods"
    ON public.payment_methods FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_super_admin = true
        )
    );

-- ================================================
-- INVOICES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,

    -- Billing details
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    due_date DATE NOT NULL,

    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,

    -- Line items as JSONB
    line_items JSONB NOT NULL, -- [{description, quantity, unit_price, total}]

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),

    -- Payment details
    stripe_invoice_id TEXT,
    paid_at TIMESTAMPTZ,
    payment_method TEXT,

    -- Metadata
    notes TEXT,
    pdf_url TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_period ON public.invoices(billing_period_start, billing_period_end);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);

-- RLS Policies
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their invoices"
    ON public.invoices FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Super admins full access to invoices"
    ON public.invoices FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_super_admin = true
        )
    );

-- ================================================
-- ENTERPRISE LEADS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.enterprise_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Contact information
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,

    -- Requirements
    estimated_seats INTEGER NOT NULL,
    message TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost')),
    assigned_to UUID REFERENCES auth.users(id), -- Super admin assigned

    -- Follow-up
    next_follow_up DATE,
    notes TEXT,

    -- Metadata
    source TEXT, -- e.g., 'pricing_page', 'contact_form'
    utm_source TEXT,
    utm_campaign TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    contacted_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_enterprise_leads_status ON public.enterprise_leads(status);
CREATE INDEX idx_enterprise_leads_assigned ON public.enterprise_leads(assigned_to);
CREATE INDEX idx_enterprise_leads_email ON public.enterprise_leads(contact_email);

-- RLS Policies
ALTER TABLE public.enterprise_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage enterprise leads"
    ON public.enterprise_leads FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_super_admin = true
        )
    );

-- ================================================
-- BILLING HISTORY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- What changed
    event_type TEXT NOT NULL CHECK (event_type IN ('subscription_created', 'subscription_updated', 'subscription_cancelled', 'payment_succeeded', 'payment_failed', 'seat_added', 'seat_removed', 'plan_upgraded', 'plan_downgraded')),

    -- Details
    old_value JSONB,
    new_value JSONB,
    amount DECIMAL(10, 2),

    -- Context
    triggered_by UUID REFERENCES auth.users(id),
    invoice_id UUID REFERENCES public.invoices(id),

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_billing_history_org ON public.billing_history(organization_id);
CREATE INDEX idx_billing_history_type ON public.billing_history(event_type);
CREATE INDEX idx_billing_history_date ON public.billing_history(created_at DESC);

-- RLS Policies
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view billing history"
    ON public.billing_history FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Super admins full access to billing history"
    ON public.billing_history FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_super_admin = true
        )
    );

-- ================================================
-- UPDATE ORGANIZATIONS TABLE
-- ================================================
-- Add OpenAI key usage tracking columns
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS uses_master_api_key BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES public.api_keys(id),
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES public.payment_methods(id),
ADD COLUMN IF NOT EXISTS mrr DECIMAL(10, 2) DEFAULT 0, -- Monthly Recurring Revenue
ADD COLUMN IF NOT EXISTS arr DECIMAL(10, 2) DEFAULT 0; -- Annual Recurring Revenue

-- Index for billing queries
CREATE INDEX IF NOT EXISTS idx_organizations_billing ON public.organizations(next_billing_date, plan) WHERE plan != 'FREE';
CREATE INDEX IF NOT EXISTS idx_organizations_mrr ON public.organizations(mrr DESC) WHERE mrr > 0;

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_num TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-([0-9]+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices;

    invoice_num := 'INV-' || LPAD(next_number::TEXT, 6, '0');
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate monthly cost based on seats
CREATE OR REPLACE FUNCTION calculate_monthly_cost(seat_count INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    IF seat_count = 1 THEN
        RETURN 30.00;
    ELSIF seat_count >= 2 AND seat_count <= 10 THEN
        RETURN seat_count * 25.00;
    ELSIF seat_count >= 11 THEN
        RETURN seat_count * 20.00;
    ELSE
        RETURN 0.00;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update MRR when seats change
CREATE OR REPLACE FUNCTION update_organization_mrr()
RETURNS TRIGGER AS $$
BEGIN
    -- Update MRR based on plan and seats
    IF NEW.plan = 'FREE' THEN
        NEW.mrr := 0;
    ELSE
        NEW.mrr := calculate_monthly_cost(NEW.seats);
    END IF;

    -- Update ARR (12x MRR or discounted if annual)
    IF NEW.billing_cycle = 'annual' THEN
        NEW.arr := NEW.mrr * 10; -- 2 months free for annual
    ELSE
        NEW.arr := NEW.mrr * 12;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update MRR
DROP TRIGGER IF EXISTS trigger_update_mrr ON public.organizations;
CREATE TRIGGER trigger_update_mrr
    BEFORE INSERT OR UPDATE OF seats, plan, billing_cycle
    ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_mrr();

-- Function to log billing events
CREATE OR REPLACE FUNCTION log_billing_event(
    p_org_id UUID,
    p_event_type TEXT,
    p_old_value JSONB,
    p_new_value JSONB,
    p_amount DECIMAL,
    p_triggered_by UUID
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.billing_history (
        organization_id,
        event_type,
        old_value,
        new_value,
        amount,
        triggered_by
    ) VALUES (
        p_org_id,
        p_event_type,
        p_old_value,
        p_new_value,
        p_amount,
        p_triggered_by
    ) RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- UPDATED_AT TRIGGERS
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.enterprise_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE public.api_keys IS 'Stores organization-specific OpenAI API keys';
COMMENT ON TABLE public.payment_methods IS 'Payment methods (cards, ACH, invoice) for organizations';
COMMENT ON TABLE public.invoices IS 'Generated invoices for billing periods';
COMMENT ON TABLE public.enterprise_leads IS 'Enterprise sales leads from contact form';
COMMENT ON TABLE public.billing_history IS 'Audit log of all billing events';

COMMENT ON COLUMN public.organizations.uses_master_api_key IS 'If true, uses system master key and charges org';
COMMENT ON COLUMN public.organizations.api_key_id IS 'Active API key for this organization';
COMMENT ON COLUMN public.organizations.mrr IS 'Monthly Recurring Revenue';
COMMENT ON COLUMN public.organizations.arr IS 'Annual Recurring Revenue';
