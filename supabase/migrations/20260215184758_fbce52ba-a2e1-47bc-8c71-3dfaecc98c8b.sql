
-- Create vehicles table
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plate text NOT NULL UNIQUE,
  model text NOT NULL,
  year integer,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

-- Add vehicle_id to trips
ALTER TABLE public.trips ADD COLUMN vehicle_id uuid REFERENCES public.vehicles(id);

-- Add vehicle_id to fuel_records
ALTER TABLE public.fuel_records ADD COLUMN vehicle_id uuid REFERENCES public.vehicles(id);

-- Insert the 2 vehicles (placeholder plates - admin can update)
INSERT INTO public.vehicles (plate, model) VALUES
  ('VEICULO-1', 'Veículo 1'),
  ('VEICULO-2', 'Veículo 2');
