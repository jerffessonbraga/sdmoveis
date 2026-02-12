
-- Tabela de viagens
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de localizações GPS
CREATE TABLE public.trip_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_trips_employee_id ON public.trips(employee_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trip_locations_trip_id ON public.trip_locations(trip_id);
CREATE INDEX idx_trip_locations_recorded_at ON public.trip_locations(recorded_at);

-- RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on trips"
ON public.trips FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on trip_locations"
ON public.trip_locations FOR ALL
USING (true)
WITH CHECK (true);

-- Habilitar realtime para localizações
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
