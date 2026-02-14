
-- Checklist items for trips (montagem checklist)
CREATE TABLE public.trip_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on trip_checklists" ON public.trip_checklists FOR ALL USING (true) WITH CHECK (true);

-- Photos taken during/after trip
CREATE TABLE public.trip_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on trip_photos" ON public.trip_photos FOR ALL USING (true) WITH CHECK (true);

-- Advance payment requests (vale/adiantamento)
CREATE TABLE public.advance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.advance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on advance_requests" ON public.advance_requests FOR ALL USING (true) WITH CHECK (true);

-- Trip incidents (SOS/imprevisto)
CREATE TABLE public.trip_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'Outro',
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'Aberto',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.trip_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on trip_incidents" ON public.trip_incidents FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for trip photos
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-photos', 'trip-photos', true);

CREATE POLICY "Anyone can read trip photos" ON storage.objects FOR SELECT USING (bucket_id = 'trip-photos');
CREATE POLICY "Anyone can upload trip photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trip-photos');
