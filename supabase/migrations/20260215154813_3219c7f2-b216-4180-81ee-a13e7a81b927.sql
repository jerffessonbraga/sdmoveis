
-- Table for fuel/refueling records
CREATE TABLE public.fuel_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  trip_id UUID REFERENCES public.trips(id),
  odometer_km NUMERIC NOT NULL,
  price_per_liter NUMERIC NOT NULL,
  total_paid NUMERIC NOT NULL,
  liters NUMERIC GENERATED ALWAYS AS (
    CASE WHEN price_per_liter > 0 THEN total_paid / price_per_liter ELSE 0 END
  ) STORED,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS with permissive policies (matching existing app pattern)
ALTER TABLE public.fuel_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read fuel_records" ON public.fuel_records FOR SELECT USING (true);
CREATE POLICY "Allow all insert fuel_records" ON public.fuel_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update fuel_records" ON public.fuel_records FOR UPDATE USING (true);
CREATE POLICY "Allow all delete fuel_records" ON public.fuel_records FOR DELETE USING (true);

-- Enable realtime for fuel records
ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_records;
