-- Create signatures table
CREATE TABLE IF NOT EXISTS public.signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_signatures_user_id ON public.signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_signatures_is_default ON public.signatures(user_id, is_default);

-- Enable RLS
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own signatures"
  ON public.signatures
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signatures"
  ON public.signatures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures"
  ON public.signatures
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signatures"
  ON public.signatures
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_signatures_updated_at
  BEFORE UPDATE ON public.signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_signatures_updated_at();

-- Create function to ensure only one default signature per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_signature()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.signatures
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ensuring single default
CREATE TRIGGER ensure_single_default_signature
  BEFORE INSERT OR UPDATE ON public.signatures
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.ensure_single_default_signature();
