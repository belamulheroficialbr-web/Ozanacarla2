/*
  TABELA DE NOTIFICAÇÕES - BELA MULHER
  Execute este SQL no Editor de SQL do seu painel Supabase.
*/

-- 1. Criar a tabela
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system', -- 'appointment', 'order', 'promo', 'system'
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança
-- Clientes podem ler suas próprias notificações
CREATE POLICY "Clientes leem suas próprias notificações"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Clientes podem marcar suas próprias como lidas (UPDATE)
CREATE POLICY "Clientes atualizam suas próprias notificações"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Administradores podem gerenciar todas as notificações
CREATE POLICY "Admins gerenciam tudo"
ON public.notifications FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 4. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
