
-- Add location column to clients table
ALTER TABLE public.clients 
ADD COLUMN location TEXT DEFAULT 'TBD';

-- Add location column to sessions table  
ALTER TABLE public.sessions
ADD COLUMN location TEXT DEFAULT 'TBD';
