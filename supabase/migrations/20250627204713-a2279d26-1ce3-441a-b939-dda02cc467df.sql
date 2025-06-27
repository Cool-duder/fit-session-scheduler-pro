
-- Add payment_type column to clients table to track their preferred payment method
ALTER TABLE public.clients 
ADD COLUMN payment_type TEXT DEFAULT 'Cash';

-- Add payment tracking to sessions table
ALTER TABLE public.sessions 
ADD COLUMN payment_type TEXT DEFAULT 'Cash',
ADD COLUMN payment_status TEXT DEFAULT 'pending';

-- Create a payments table to track individual payments
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('Cash', 'Venmo', 'Check', 'Zelle')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
CREATE POLICY "Enable read access for all users" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.payments FOR DELETE USING (true);
