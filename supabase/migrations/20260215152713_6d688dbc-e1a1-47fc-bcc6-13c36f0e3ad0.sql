
-- Adicionar tipo de checklist (diário vs entrega)
ALTER TABLE public.trip_checklists
ADD COLUMN checklist_type TEXT NOT NULL DEFAULT 'daily';

-- Adicionar status da montagem na viagem
ALTER TABLE public.trips
ADD COLUMN montagem_status TEXT NOT NULL DEFAULT 'em_andamento';

-- Adicionar project_id opcional na viagem para vincular à obra
ALTER TABLE public.trips
ADD COLUMN project_id UUID REFERENCES public.client_projects(id) ON DELETE SET NULL;
