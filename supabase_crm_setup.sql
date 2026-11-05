/*
  MÓDULO CRM INTELIGENTE - BELA MULHER
  Execute este SQL no Editor de SQL do seu painel Supabase.
*/

-- 0. Adicionar coluna de aniversário no perfil se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'birth_date') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_date DATE;
    END IF;
END $$;

-- 1. Tabela de Campanhas de CRM
CREATE TABLE IF NOT EXISTS public.crm_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_segment TEXT NOT NULL, -- 'new', 'frequent', 'inactive_30', 'inactive_60', 'inactive_90', 'birthday'
    message_template TEXT NOT NULL,
    discount_coupon_id UUID REFERENCES public.coupons(id),
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sent'
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Tabela de Logs de Campanhas (Histórico de envios por cliente)
CREATE TABLE IF NOT EXISTS public.crm_campaign_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.crm_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'delivered',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. RLS
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaign_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam campanhas" ON public.crm_campaigns FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins gerenciam logs CRM" ON public.crm_campaign_logs FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_campaign_logs;
