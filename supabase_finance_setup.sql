/*
  GESTÃO FINANCEIRA AVANÇADA - BELA MULHER
  Execute este SQL no Editor de SQL do seu painel Supabase.
*/

-- 1. Ampliar a tabela de Transações (Transactions)
-- Adicionando colunas necessárias para controle avançado se não existirem
DO $$ 
BEGIN 
    -- Status do pagamento (pago, pendente, cancelado)
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.transactions'::regclass AND attname = 'status') THEN
        ALTER TABLE public.transactions ADD COLUMN status TEXT DEFAULT 'pago';
    END IF;

    -- Data de vencimento (para despesas pendentes)
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.transactions'::regclass AND attname = 'due_date') THEN
        ALTER TABLE public.transactions ADD COLUMN due_date DATE;
    END IF;

    -- Fornecedor ou Favorecido
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.transactions'::regclass AND attname = 'vendor') THEN
        ALTER TABLE public.transactions ADD COLUMN vendor TEXT;
    END IF;

    -- Link com Agendamento ou Pedido (para evitar duplicidade)
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.transactions'::regclass AND attname = 'related_id') THEN
        ALTER TABLE public.transactions ADD COLUMN related_id TEXT;
    END IF;

    -- Tipo de relação (appointment, order, commission, manual)
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.transactions'::regclass AND attname = 'related_type') THEN
        ALTER TABLE public.transactions ADD COLUMN related_type TEXT DEFAULT 'manual';
    END IF;
END $$;

-- 2. Ampliar perfis para profissionais (Comissões)
DO $$ 
BEGIN 
    -- Percentual de comissão padrão do profissional
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'commission_rate') THEN
        ALTER TABLE public.profiles ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;
END $$;

-- 3. Criar Tabela de Comissões (Opcional, mas recomendado para extrato limpo)
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    service_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid'
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS para Comissões
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profissionais leem suas próprias comissões" 
ON public.commissions FOR SELECT 
TO authenticated 
USING (auth.uid() = professional_id);

CREATE POLICY "Admins gerenciam todas as comissões" 
ON public.commissions FOR ALL 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
