
-- Tabela para arquivos de projeto (fotos/PDFs do Promob)
CREATE TABLE public.arquivos_projeto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  description TEXT,
  uploaded_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS habilitado
ALTER TABLE public.arquivos_projeto ENABLE ROW LEVEL SECURITY;

-- Acesso público (leitura e escrita) igual às demais tabelas do projeto
CREATE POLICY "Allow all on arquivos_projeto"
  ON public.arquivos_projeto
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Bucket de storage para os arquivos
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', true);

-- Política de leitura pública no bucket
CREATE POLICY "Public read project-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files');

-- Política de upload
CREATE POLICY "Allow upload project-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-files');

-- Política de delete
CREATE POLICY "Allow delete project-files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-files');
