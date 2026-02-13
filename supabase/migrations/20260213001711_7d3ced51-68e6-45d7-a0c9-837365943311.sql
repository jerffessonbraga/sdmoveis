
-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  access_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- Client projects
CREATE TABLE public.client_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  project_type TEXT,
  material TEXT,
  warranty TEXT DEFAULT '5 Anos',
  status TEXT NOT NULL DEFAULT 'Em Negociação',
  total_value NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'Pendente',
  signed_at TIMESTAMPTZ,
  estimated_delivery DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on client_projects" ON public.client_projects FOR ALL USING (true) WITH CHECK (true);

-- Project installments
CREATE TABLE public.project_installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  installment_number INT NOT NULL,
  total_installments INT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on project_installments" ON public.project_installments FOR ALL USING (true) WITH CHECK (true);

-- Project timeline steps
CREATE TABLE public.project_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  step_date TEXT,
  done BOOLEAN NOT NULL DEFAULT false,
  icon TEXT DEFAULT '📋',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on project_timeline" ON public.project_timeline FOR ALL USING (true) WITH CHECK (true);

-- Project production steps
CREATE TABLE public.project_production_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Aguardando',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_production_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on project_production_steps" ON public.project_production_steps FOR ALL USING (true) WITH CHECK (true);

-- Gallery renders
CREATE TABLE public.project_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on project_gallery" ON public.project_gallery FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_projects_updated_at BEFORE UPDATE ON public.client_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
