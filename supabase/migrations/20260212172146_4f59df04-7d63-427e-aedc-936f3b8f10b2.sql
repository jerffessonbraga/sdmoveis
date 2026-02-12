
-- Table for overtime, advances, and deductions per employee per period
CREATE TABLE public.employee_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('overtime', 'advance', 'discount')),
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  hours NUMERIC DEFAULT 0,
  reference_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_adjustments ENABLE ROW LEVEL SECURITY;

-- Permissive policy (matching existing pattern)
CREATE POLICY "Allow all operations on employee_adjustments"
  ON public.employee_adjustments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_adjustments;
