
-- Find and remove duplicate sessions for Lisa Revson on June 12th
-- This will keep only the earliest created session and remove any duplicates
DELETE FROM public.sessions 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY client_name, date, time 
             ORDER BY created_at ASC
           ) as row_num
    FROM public.sessions 
    WHERE client_name = 'Lisa Revson' 
    AND date = '2024-06-12'
  ) ranked_sessions 
  WHERE row_num > 1
);
