
-- Quality inspection checklist for projects (admin)
CREATE TABLE public.quality_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  inspector_name TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.quality_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on quality_checklists" ON public.quality_checklists FOR ALL USING (true) WITH CHECK (true);

-- Individual quality check items
CREATE TABLE public.quality_check_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.quality_checklists(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  note TEXT
);
ALTER TABLE public.quality_check_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on quality_check_items" ON public.quality_check_items FOR ALL USING (true) WITH CHECK (true);

-- Project cost tracking (materials, labor, travel)
CREATE TABLE public.project_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Material',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'un',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on project_costs" ON public.project_costs FOR ALL USING (true) WITH CHECK (true);

-- Tool inventory assigned to employees
CREATE TABLE public.tool_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  serial_number TEXT,
  condition TEXT NOT NULL DEFAULT 'Bom',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);
ALTER TABLE public.tool_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on tool_inventory" ON public.tool_inventory FOR ALL USING (true) WITH CHECK (true);

-- Tool issue reports from employees
CREATE TABLE public.tool_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID NOT NULL REFERENCES public.tool_inventory(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL DEFAULT 'Defeito',
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aberto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.tool_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on tool_reports" ON public.tool_reports FOR ALL USING (true) WITH CHECK (true);

-- Digital signatures for delivery
CREATE TABLE public.delivery_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on delivery_signatures" ON public.delivery_signatures FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for signatures
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', true);
CREATE POLICY "Anyone can read signatures" ON storage.objects FOR SELECT USING (bucket_id = 'signatures');
CREATE POLICY "Anyone can upload signatures" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'signatures');

-- Maintenance requests from clients
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'Preventiva',
  description TEXT NOT NULL,
  preferred_date TEXT,
  status TEXT NOT NULL DEFAULT 'Solicitado',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on maintenance_requests" ON public.maintenance_requests FOR ALL USING (true) WITH CHECK (true);
