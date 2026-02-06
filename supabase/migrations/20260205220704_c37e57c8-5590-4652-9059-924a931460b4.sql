-- Tabela de conversas WhatsApp
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  lead_status TEXT DEFAULT 'lead' CHECK (lead_status IN ('lead', 'negotiating', 'client')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mensagens WhatsApp
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'template')),
  whatsapp_message_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_whatsapp_conversations_phone ON public.whatsapp_conversations(phone_number);
CREATE INDEX idx_whatsapp_messages_conversation ON public.whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para o modo simulado (em produção, restringir por user_id)
CREATE POLICY "Allow all operations on conversations" ON public.whatsapp_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on messages" ON public.whatsapp_messages FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar last_message_at na conversa
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.whatsapp_conversations 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Dados de exemplo para modo simulado
INSERT INTO public.whatsapp_conversations (phone_number, contact_name, lead_status) VALUES
  ('5511999991234', 'Ricardo Almeida', 'client'),
  ('5511988885678', 'Juliana Costa', 'negotiating'),
  ('5511977779012', 'Marcos Silva', 'lead');

INSERT INTO public.whatsapp_messages (conversation_id, direction, content, status) 
SELECT id, 'inbound', 'Bom dia! Gostaria de saber como está a produção do meu projeto.', 'read'
FROM public.whatsapp_conversations WHERE contact_name = 'Ricardo Almeida';

INSERT INTO public.whatsapp_messages (conversation_id, direction, content, status) 
SELECT id, 'outbound', 'Olá Ricardo! Seu projeto está 85% concluído. Previsão de entrega: próxima semana!', 'delivered'
FROM public.whatsapp_conversations WHERE contact_name = 'Ricardo Almeida';