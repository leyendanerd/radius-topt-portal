-- Create table for RADIUS server configuration
CREATE TABLE public.radius_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_ip text NOT NULL,
  server_port integer NOT NULL DEFAULT 1812,
  shared_secret text NOT NULL,
  service text NOT NULL DEFAULT 'hotspot',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.radius_config ENABLE ROW LEVEL SECURITY;

-- Policies for admins
CREATE POLICY "Admins can view RADIUS config"
  ON public.radius_config FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert RADIUS config"
  ON public.radius_config FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update RADIUS config"
  ON public.radius_config FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete RADIUS config"
  ON public.radius_config FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_radius_config_updated_at
  BEFORE UPDATE ON public.radius_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();