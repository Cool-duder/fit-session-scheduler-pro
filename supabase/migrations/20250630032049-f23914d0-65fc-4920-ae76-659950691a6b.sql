
-- Create a table to track package purchases
CREATE TABLE public.package_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  package_name TEXT NOT NULL,
  package_sessions INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_type TEXT NOT NULL DEFAULT 'Cash',
  payment_status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for faster queries
CREATE INDEX idx_package_purchases_client_id ON public.package_purchases(client_id);
CREATE INDEX idx_package_purchases_date ON public.package_purchases(purchase_date);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_package_purchases_updated_at 
    BEFORE UPDATE ON public.package_purchases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
