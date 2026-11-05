/*
  ESTOQUE INTELIGENTE E CONTROLE DE PRODUTOS - BELA MULHER
  Execute este SQL no Editor de SQL do seu painel Supabase se desejar atualizar as colunas.
*/

-- 1. Ampliar a tabela de Produtos (Products)
DO $$ 
BEGIN 
    -- Preço de custo
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'cost_price') THEN
        ALTER TABLE public.products ADD COLUMN cost_price DECIMAL(10,2) DEFAULT 0.00;
    END IF;

    -- Preço de venda
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'sale_price') THEN
        ALTER TABLE public.products ADD COLUMN sale_price DECIMAL(10,2) DEFAULT 0.00;
    END IF;

    -- Quantidade atual
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'quantity') THEN
        ALTER TABLE public.products ADD COLUMN quantity INTEGER DEFAULT 0;
    END IF;

    -- Estoque mínimo para alerta
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'min_quantity') THEN
        ALTER TABLE public.products ADD COLUMN min_quantity INTEGER DEFAULT 5;
    END IF;

    -- Categoria
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'category') THEN
        ALTER TABLE public.products ADD COLUMN category TEXT DEFAULT 'Geral';
    END IF;

    -- URL de imagem e descrição
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'image_url') THEN
        ALTER TABLE public.products ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'description') THEN
        ALTER TABLE public.products ADD COLUMN description TEXT;
    END IF;
END $$;

-- 2. Criar ou Ampliar a tabela de Movimentações de Estoque (Stock Movements)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'entrada', 'saida', 'perda', 'ajuste'
    quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    related_id TEXT, -- ID de pedido ou transação para evitar duplicidade
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir colunas adicionais se tabela já existia
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.stock_movements'::regclass AND attname = 'unit_cost') THEN
        ALTER TABLE public.stock_movements ADD COLUMN unit_cost DECIMAL(10,2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.stock_movements'::regclass AND attname = 'total_cost') THEN
        ALTER TABLE public.stock_movements ADD COLUMN total_cost DECIMAL(10,2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.stock_movements'::regclass AND attname = 'related_id') THEN
        ALTER TABLE public.stock_movements ADD COLUMN related_id TEXT;
    END IF;
END $$;

-- 3. RLS para Movimentações e Produtos
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de produtos" 
ON public.products FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Apenas admin gerencia estoque e produtos" 
ON public.products FOR ALL 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Apenas admin lê e gerencia movimentações de estoque" 
ON public.stock_movements FOR ALL 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
