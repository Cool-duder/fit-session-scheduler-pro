
-- Add price column to clients table
ALTER TABLE public.clients 
ADD COLUMN price DECIMAL(10,2) DEFAULT 120.00;
