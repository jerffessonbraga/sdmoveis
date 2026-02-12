
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Allow all operations on employees" ON public.employees;
DROP POLICY IF EXISTS "Allow all operations on time_entries" ON public.time_entries;

CREATE POLICY "Allow all operations on employees"
ON public.employees FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on time_entries"
ON public.time_entries FOR ALL
USING (true)
WITH CHECK (true);
