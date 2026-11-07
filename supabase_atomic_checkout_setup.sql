-- =========================================================================
-- INSTALAÇÃO DEFINITIVA BLINDADA: CHECKOUT ATÔMICO E ESTOQUE INTELIGENTE
-- PROJETO SRA. BELA MULHER - BANCO SUPABASE (ovpvjghokiyxptvpmumw)
-- =========================================================================
-- DIRETRIZES DE SEGURANÇA E INTEGRIDADE:
-- 1. NÃO apaga nem altera tabelas existentes (profiles, services, appointments, transactions intocadas).
-- 2. NÃO insere produtos fictícios nem caminhos locais de imagens. Cria apenas a estrutura limpa.
-- 3. Valida no servidor todos os preços reais com base em products.sale_price.
-- 4. Valida subtotal, cupons (percentual/fixo e valor mínimo) e total_amount no banco.
-- 5. Restringe RLS INSERT de orders para que o usuário autenticado só possa criar pedidos em seu próprio nome.
-- 6. Adiciona tabelas ao supabase_realtime somente se ainda não estiverem publicadas.
-- 7. Garante atomicidade total (ACID) e idempotência concorrente via Advisory Lock.
-- =========================================================================

-- =========================================================================
-- 1. TABELA DE PRODUTOS (public.products)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    cost_price NUMERIC(10,2) DEFAULT 0.00,
    sale_price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (sale_price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_quantity INTEGER DEFAULT 5,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir colunas se a tabela products já existia previamente
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'cost_price') THEN
        ALTER TABLE public.products ADD COLUMN cost_price NUMERIC(10,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'sale_price') THEN
        ALTER TABLE public.products ADD COLUMN sale_price NUMERIC(10,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'quantity') THEN
        ALTER TABLE public.products ADD COLUMN quantity INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'min_quantity') THEN
        ALTER TABLE public.products ADD COLUMN min_quantity INTEGER DEFAULT 5;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'category') THEN
        ALTER TABLE public.products ADD COLUMN category TEXT DEFAULT 'Geral';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'image_url') THEN
        ALTER TABLE public.products ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'description') THEN
        ALTER TABLE public.products ADD COLUMN description TEXT;
    END IF;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Leitura pública de produtos') THEN
        CREATE POLICY "Leitura pública de produtos" ON public.products FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins gerenciam produtos') THEN
        CREATE POLICY "Admins gerenciam produtos" ON public.products FOR ALL TO authenticated USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- =========================================================================
-- 2. TABELA DE MOVIMENTAÇÕES DE ESTOQUE (public.stock_movements)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('entrada', 'saida', 'estorno', 'perda', 'ajuste')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    unit_cost NUMERIC(10,2) DEFAULT 0.00,
    total_cost NUMERIC(10,2) DEFAULT 0.00,
    related_id TEXT, -- ID do pedido vinculado para idempotência
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_related ON public.stock_movements(related_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_stock_movements_related_product_type'
    ) THEN
        ALTER TABLE public.stock_movements 
        ADD CONSTRAINT uq_stock_movements_related_product_type 
        UNIQUE (related_id, product_id, type);
    END IF;
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_movements' AND policyname = 'Apenas admin lê e gerencia movimentações de estoque') THEN
        CREATE POLICY "Apenas admin lê e gerencia movimentações de estoque" ON public.stock_movements FOR ALL TO authenticated USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- =========================================================================
-- 3. TABELA DE PEDIDOS (public.orders)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    coupon_applied TEXT,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL DEFAULT 'PIX',
    payment_status TEXT NOT NULL DEFAULT 'pendente', -- Todo pedido nasce como 'pendente'
    payment_gateway_status TEXT DEFAULT 'awaiting_payment_confirmation',
    pix_code TEXT,
    delivery_status TEXT DEFAULT 'em_separacao',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    -- 1. Leitura de Pedidos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Clientes visualizam apenas seus próprios pedidos') THEN
        CREATE POLICY "Clientes visualizam apenas seus próprios pedidos" ON public.orders FOR SELECT TO authenticated USING (
            client_id = auth.uid()::text OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional'))
        );
    END IF;

    -- 2. Inserção Segura: impede criar pedido em nome de outro usuário
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Clientes inserem seus próprios pedidos') THEN
        DROP POLICY "Clientes inserem seus próprios pedidos" ON public.orders;
    END IF;

    CREATE POLICY "Clientes inserem seus próprios pedidos estritamente" ON public.orders FOR INSERT TO authenticated WITH CHECK (
        client_id = auth.uid()::text
    );

    -- 3. Atualização de Pedidos restrita a administradores
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Apenas admin atualiza pedidos') THEN
        CREATE POLICY "Apenas admin atualiza pedidos" ON public.orders FOR UPDATE TO authenticated USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- =========================================================================
-- 4. FUNÇÃO RPC TRANSACIONAL ATÔMICA: create_order_with_stock_atomic
-- =========================================================================
CREATE OR REPLACE FUNCTION public.create_order_with_stock_atomic(
    p_order JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order_id TEXT;
    v_client_id TEXT;
    v_items JSONB;
    v_item RECORD;
    v_product_id TEXT;
    v_product_name TEXT;
    v_product_sale_price NUMERIC(10,2);
    v_quantity INTEGER;
    v_current_stock INTEGER;
    
    -- Variáveis para validação financeira fidedigna no banco de dados
    v_calculated_subtotal NUMERIC(10,2) := 0.00;
    v_calculated_discount NUMERIC(10,2) := 0.00;
    v_calculated_total NUMERIC(10,2) := 0.00;
    v_coupon_code TEXT;
    v_validated_items JSONB := '[]'::jsonb;
    
    v_inserted_order RECORD;
    v_existing_order RECORD;
    v_lock_key BIGINT;
BEGIN
    -- 0. Validação de Autenticação Estrita
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: Usuário não autenticado.';
    END IF;

    v_client_id := auth.uid()::text;

    -- Identificador do Pedido
    v_order_id := trim(p_order->>'id');
    IF v_order_id IS NULL OR v_order_id = '' THEN
        v_order_id := 'ord-' || floor(1000 + random() * 9000)::text;
    END IF;

    v_items := p_order->'items';
    IF v_items IS NULL OR jsonb_array_length(v_items) = 0 THEN
        RAISE EXCEPTION 'O pedido não contém produtos válidos.';
    END IF;

    -- 1. Trava Consultiva para Idempotência Concorrente (Advisory Lock por Hash)
    v_lock_key := ('x' || substr(md5(v_order_id), 1, 15))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- 2. Idempotência e Validação Estrita de Propriedade do Pedido
    SELECT * INTO v_existing_order FROM public.orders WHERE id = v_order_id;
    IF v_existing_order.id IS NOT NULL THEN
        IF v_existing_order.client_id <> v_client_id AND NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Acesso negado: Este identificador de pedido pertence a outro usuário.';
        END IF;
        -- Retorna o pedido já existente sem reprocessar estoque nem duplicar saídas
        RETURN to_jsonb(v_existing_order);
    END IF;

    -- 3. Processamento Atômico de Baixa de Estoque e Cálculo de Preços Reais
    -- Agrupamento seguro: trata produtos repetidos agregando suas quantidades
    FOR v_item IN 
        SELECT 
            x.id AS product_id, 
            SUM(COALESCE(x.quantity, 1))::integer AS total_quantity
        FROM jsonb_to_recordset(v_items) AS x(
            id text, 
            quantity integer
        )
        GROUP BY x.id
        ORDER BY x.id -- Ordem fixa evita deadlocks entre transações concorrentes
    LOOP
        v_product_id := v_item.product_id;
        v_quantity := v_item.total_quantity;

        IF v_quantity <= 0 THEN
            RAISE EXCEPTION 'Quantidade inválida para o produto ID: %.', v_product_id;
        END IF;

        -- Bloqueio pessimista de linha na tabela products (FOR UPDATE)
        SELECT name, sale_price, quantity INTO v_product_name, v_product_sale_price, v_current_stock 
        FROM public.products 
        WHERE id = v_product_id 
        FOR UPDATE;

        IF v_product_name IS NULL THEN
            RAISE EXCEPTION 'Produto não cadastrado no catálogo: ID %.', v_product_id;
        END IF;

        -- Validação de Estoque Disponível
        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION 'Estoque insuficiente para o produto "%" (Disponível: %, Solicitado: %). Pedido cancelado.', 
                v_product_name, v_current_stock, v_quantity;
        END IF;

        -- Cálculo financeiro seguro baseado no preço do banco de dados (ignora valores enviados pelo frontend)
        v_calculated_subtotal := v_calculated_subtotal + (v_product_sale_price * v_quantity);

        -- Estruturação dos itens do pedido com o preço oficial auditado
        v_validated_items := v_validated_items || jsonb_build_object(
            'id', v_product_id,
            'name', v_product_name,
            'price', v_product_sale_price,
            'quantity', v_quantity
        );

        -- Atualização do Saldo do Produto
        UPDATE public.products 
        SET quantity = quantity - v_quantity,
            updated_at = now()
        WHERE id = v_product_id;

        -- Registro 1:1 da Movimentação de Saída em stock_movements
        INSERT INTO public.stock_movements (
            id,
            product_id,
            product_name,
            type,
            quantity,
            reason,
            related_id,
            date,
            created_at
        ) VALUES (
            'mov-' || floor(100000 + random() * 900000)::text,
            v_product_id,
            v_product_name,
            'saida',
            v_quantity,
            'Venda Pedido #' || v_order_id,
            v_order_id,
            now(),
            now()
        );
    END LOOP;

    -- 4. Validação de Cupons e Regras de Desconto no Banco
    v_coupon_code := upper(trim(COALESCE(p_order->>'coupon_applied', '')));
    IF v_coupon_code <> '' THEN
        IF v_coupon_code = 'BELA10' THEN
            IF v_calculated_subtotal >= 50.00 THEN
                v_calculated_discount := ROUND((v_calculated_subtotal * 0.10), 2);
            END IF;
        ELSIF v_coupon_code = 'BELA20' THEN
            IF v_calculated_subtotal >= 100.00 THEN
                v_calculated_discount := 20.00;
            END IF;
        ELSIF v_coupon_code = 'PRIMEIRACOMPRA' THEN
            IF v_calculated_subtotal >= 40.00 THEN
                v_calculated_discount := ROUND((v_calculated_subtotal * 0.15), 2);
            END IF;
        END IF;
    END IF;

    -- Garantir que o desconto não exceda o subtotal
    IF v_calculated_discount > v_calculated_subtotal THEN
        v_calculated_discount := v_calculated_subtotal;
    END IF;

    v_calculated_total := v_calculated_subtotal - v_calculated_discount;

    -- 5. Inserir Pedido com Dados e Totais Validados no Banco (sempre 'pendente')
    INSERT INTO public.orders (
        id,
        client_id,
        client_name,
        client_phone,
        client_email,
        items,
        subtotal,
        discount_amount,
        coupon_applied,
        total_amount,
        payment_method,
        payment_status,
        payment_gateway_status,
        pix_code,
        delivery_status,
        notes,
        created_at
    ) VALUES (
        v_order_id,
        v_client_id,
        COALESCE(p_order->>'client_name', 'Cliente'),
        p_order->>'client_phone',
        p_order->>'client_email',
        v_validated_items,
        v_calculated_subtotal,
        v_calculated_discount,
        NULLIF(v_coupon_code, ''),
        v_calculated_total,
        COALESCE(p_order->>'payment_method', 'PIX'),
        'pendente', -- REGRA: Todo pedido inicia estritamente como 'pendente'
        COALESCE(p_order->>'payment_gateway_status', 'awaiting_payment_confirmation'),
        p_order->>'pix_code',
        COALESCE(p_order->>'delivery_status', 'em_separacao'),
        p_order->>'notes',
        now()
    )
    RETURNING * INTO v_inserted_order;

    -- Retorna o pedido completo persistido e com estoque deduzido de forma 100% atômica
    RETURN to_jsonb(v_inserted_order);
END;
$$;

-- Permissões de Execução Seguras
REVOKE ALL ON FUNCTION public.create_order_with_stock_atomic(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_stock_atomic(JSONB) TO authenticated;

-- Inclusão idempotente no supabase_realtime (somente se não estiver publicado)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'stock_movements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
    END IF;
END $$;
