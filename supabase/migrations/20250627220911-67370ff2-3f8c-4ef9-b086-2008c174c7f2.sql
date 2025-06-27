
-- Add birthday field to clients table
ALTER TABLE public.clients 
ADD COLUMN birthday DATE;

-- Add comment for clarity
COMMENT ON COLUMN public.clients.birthday IS 'Client birthday for sending birthday wishes';
