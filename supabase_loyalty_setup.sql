/*
  SISTEMA DE FIDELIDADE - BELA MULHER
  Execute este SQL no Editor de SQL do seu painel Supabase.
*/

-- 1. Tabela de Recompensas (Catálogo)
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    benefit_type TEXT NOT NULL, -- 'discount', 'service', 'product'
    benefit_value DECIMAL(10,2), -- Valor do desconto se aplicável
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Transações de Pontos (Extrato)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positivo para ganho, negativo para resgate
    type TEXT NOT NULL, -- 'earn', 'redeem', 'expire', 'manual'
    description TEXT,
    related_id TEXT, -- ID do agendamento ou da recompensa
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Configuração de Regras
CREATE TABLE IF NOT EXISTS public.loyalty_config (
    id TEXT PRIMARY KEY DEFAULT 'current',
    points_per_real DECIMAL(10,2) DEFAULT 1.0, -- Ex: 1 real = 1 ponto
    min_points_to_redeem INTEGER DEFAULT 100,
    points_expiry_days INTEGER DEFAULT 365,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir config padrão se não existir
INSERT INTO public.loyalty_config (id, points_per_real) 
VALUES ('current', 1.0) 
ON CONFLICT (id) DO NOTHING;

-- Inserir recompensas iniciais
INSERT INTO public.loyalty_rewards (name, description, points_cost, benefit_type, benefit_value)
VALUES 
('Desconto de R$ 10,00', 'Resgate 100 pontos para ganhar R$ 10 de desconto na sua próxima visita.', 100, 'discount', 10.00),
('Desconto de R$ 25,00', 'Resgate 200 pontos para ganhar R$ 25 de desconto na sua próxima visita.', 200, 'discount', 25.00),
('Hidratação Express', 'Troque 350 pontos por uma hidratação capilar expressa.', 350, 'service', 0.00),
('Esmaltação Cortesia', 'Troque 150 pontos por uma esmaltação simples.', 150, 'service', 0.00)
ON CONFLICT DO NOTHING;

-- 4. Adicionar coluna de pontos no perfil para consulta rápida
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'loyalty_points') THEN
        ALTER TABLE public.profiles ADD COLUMN loyalty_points INTEGER DEFAULT 0;
    END IF;
END $$;

-- 5. RLS
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_config ENABLE ROW LEVEL SECURITY;

-- Políticas Rewards
CREATE POLICY "Leitura pública de recompensas" ON public.loyalty_rewards FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins gerenciam recompensas" ON public.loyalty_rewards FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas Transactions
CREATE POLICY "Clientes leem suas transações" ON public.loyalty_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins gerenciam transações" ON public.loyalty_transactions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas Config
CREATE POLICY "Leitura de config" ON public.loyalty_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins gerenciam config" ON public.loyalty_config FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Função para atualizar saldo no perfil via Trigger
CREATE OR REPLACE FUNCTION update_profile_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles 
        SET loyalty_points = loyalty_points + NEW.amount
        WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles 
        SET loyalty_points = loyalty_points - OLD.amount
        WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_points
AFTER INSERT OR DELETE ON public.loyalty_transactions
FOR EACH ROW EXECUTE FUNCTION update_profile_loyalty_points();

-- 7. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_rewards;
