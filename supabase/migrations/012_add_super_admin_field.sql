-- Add super admin field to users table
ALTER TABLE public.users
ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for faster super admin lookups
CREATE INDEX idx_users_super_admin ON public.users(is_super_admin) WHERE is_super_admin = TRUE;

-- Add comment
COMMENT ON COLUMN public.users.is_super_admin IS 'Flag indicating if user has super admin privileges for system-wide access';
