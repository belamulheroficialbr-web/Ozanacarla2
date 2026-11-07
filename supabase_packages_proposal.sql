-- =========================================================================
-- PROPOSTA DE MODELAGEM SQL REFORÇADA PARA O MÓDULO DE PACOTES E COMBOS
-- SRA. BELA MULHER
-- ATENÇÃO: NÃO EXECUTE ESTE SCRIPT DIRETAMENTE NO SUPABASE. MANTIDO APENAS COMO PROPOSTA.
-- =========================================================================

-- 1. Cadastro de Pacotes e Combos
CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    promotional_price NUMERIC(10,2) CHECK (promotional_price IS NULL OR promotional_price >= 0),
    validity_days INTEGER DEFAULT 90 CHECK (validity_days > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Itens (Serviços) incluídos no Pacote
CREATE TABLE IF NOT EXISTS service_package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES service_packages(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL, -- Referência ao ID da tabela 'services'
    service_name TEXT NOT NULL,
    quantity_sessions INTEGER NOT NULL DEFAULT 1 CHECK (quantity_sessions > 0),
    reference_price NUMERIC(10,2) NOT NULL CHECK (reference_price >= 0)
);

-- 3. Carteira de Pacotes Adquiridos por Cliente
CREATE TABLE IF NOT EXISTS client_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL, -- Referência ao ID da tabela 'profiles'
    package_id UUID REFERENCES service_packages(id),
    package_name TEXT NOT NULL,
    order_id TEXT, -- Vínculo com a tabela 'orders'
    total_paid NUMERIC(10,2) NOT NULL CHECK (total_paid >= 0),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'completed'))
);

-- 4. Histórico de Movimentações, Consumo e Reversão de Sessões
CREATE TABLE IF NOT EXISTS package_session_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_package_id UUID REFERENCES client_packages(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    appointment_id TEXT, -- Sem UNIQUE global para permitir reversão e re-consumo legítimo
    movement_type TEXT NOT NULL CHECK (movement_type IN ('consume', 'revert', 'adjust')),
    sessions_count INTEGER NOT NULL DEFAULT 1 CHECK (sessions_count > 0),
    reverted_movement_id UUID REFERENCES package_session_movements(id), -- Identifica o movimento original em caso de reversão
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices e Restrições de Idempotência e Uniciedade Parcial
CREATE INDEX IF NOT EXISTS idx_client_packages_client ON client_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_session_mov_appointment ON package_session_movements(appointment_id);
CREATE INDEX IF NOT EXISTS idx_package_items_package ON service_package_items(package_id);

-- Índice único parcial: impede duas reversões para o mesmo movimento original de consumo
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_reversion_per_consume 
ON package_session_movements(reverted_movement_id) 
WHERE movement_type = 'revert';

-- =========================================================================
-- 5. SEGURANÇA RLS (ROW LEVEL SECURITY) PROPOSTA
-- =========================================================================

ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_session_movements ENABLE ROW LEVEL SECURITY;

-- Políticas para service_packages (Leitura pública para pacotes ativos, escrita apenas ADM)
CREATE POLICY "Permitir leitura de pacotes ativos para todos" ON service_packages
    FOR SELECT USING (is_active = true OR current_setting('request.jwt.claim.role', true) = 'admin');

CREATE POLICY "Permitir gestão de pacotes apenas para ADM" ON service_packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Políticas para service_package_items (Leitura pública, escrita ADM)
CREATE POLICY "Permitir leitura de itens de pacotes para todos" ON service_package_items
    FOR SELECT USING (true);

CREATE POLICY "Permitir gestão de itens de pacotes apenas para ADM" ON service_package_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Políticas para client_packages (Cliente lê apenas os seus, ADM lê/gerencia todos)
CREATE POLICY "Cliente visualiza apenas seus próprios pacotes" ON client_packages
    FOR SELECT USING (
        client_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'professional')
        )
    );

CREATE POLICY "Apenas ADM gerencia carteiras de pacotes" ON client_packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Políticas para package_session_movements
CREATE POLICY "Cliente e equipe visualizam movimentações autorizadas" ON package_session_movements
    FOR SELECT USING (
        client_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'professional')
        )
    );

CREATE POLICY "Apenas ADM e funções autorizadas gravam movimentações" ON package_session_movements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'professional')
        )
    );

-- =========================================================================
-- 6. FUNÇÃO RPC TRANSACIONAL: CONSUMO SEGURO DE SESSÃO
-- =========================================================================

CREATE OR REPLACE FUNCTION consume_package_session(
    p_client_package_id UUID,
    p_client_id TEXT,
    p_service_id TEXT,
    p_appointment_id TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_total_contracted INTEGER;
    v_total_consumed INTEGER;
    v_appointment_status TEXT;
    v_package_status TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- 0. Validação de Autenticação e Autorização rigorosa
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    IF NOT (
        p_client_id = auth.uid()::text OR
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'professional'))
    ) THEN
        RAISE EXCEPTION 'Acesso não autorizado para consumir sessão deste pacote.';
    END IF;

    -- 1. Verificar status real do agendamento na tabela 'appointments'
    SELECT status INTO v_appointment_status
    FROM appointments
    WHERE id = p_appointment_id;

    IF v_appointment_status IS NULL OR (v_appointment_status <> 'concluded' AND v_appointment_status <> 'concluído') THEN
        RAISE EXCEPTION 'O atendimento precisa estar com status concluído para consumir uma sessão do pacote.';
    END IF;

    -- 2. Verificar validade e status do pacote da cliente com bloqueio de linha (FOR UPDATE)
    SELECT status, expires_at INTO v_package_status, v_expires_at
    FROM client_packages
    WHERE id = p_client_package_id AND client_id = p_client_id
    FOR UPDATE;

    IF v_package_status IS NULL OR v_package_status <> 'active' THEN
        RAISE EXCEPTION 'O pacote selecionado não está ativo.';
    END IF;

    IF v_expires_at < NOW() THEN
        -- Atualizar status para expirado
        UPDATE client_packages SET status = 'expired' WHERE id = p_client_package_id;
        RAISE EXCEPTION 'O pacote selecionado está expirado.';
    END IF;

    -- 3. Validação de Idempotência: Impedir dois consumos ativos para o mesmo atendimento e pacote
    IF EXISTS (
        SELECT 1 FROM package_session_movements 
        WHERE appointment_id = p_appointment_id 
          AND client_package_id = p_client_package_id
          AND movement_type = 'consume'
          AND NOT EXISTS (
              SELECT 1 FROM package_session_movements r 
              WHERE r.reverted_movement_id = package_session_movements.id 
                AND r.movement_type = 'revert'
          )
    ) THEN
        RAISE EXCEPTION 'Este atendimento já possui um consumo ativo registrado para este pacote.';
    END IF;

    -- 4. Calcular total de sessões contratadas para este serviço no pacote
    SELECT COALESCE(SUM(quantity_sessions), 0) INTO v_total_contracted
    FROM service_package_items spi
    JOIN client_packages cp ON cp.package_id = spi.package_id
    WHERE cp.id = p_client_package_id AND spi.service_id = p_service_id;

    -- 5. Calcular total de sessões já consumidas (menos reversões)
    SELECT COALESCE(SUM(
        CASE 
            WHEN movement_type = 'consume' THEN sessions_count 
            WHEN movement_type = 'revert' THEN -sessions_count 
            ELSE 0 
        END
    ), 0) INTO v_total_consumed
    FROM package_session_movements
    WHERE client_package_id = p_client_package_id AND service_id = p_service_id;

    -- 6. Validação de Saldo Suficiente (Proteção contra saldo negativo)
    IF v_total_consumed + 1 > v_total_contracted THEN
        RAISE EXCEPTION 'Saldo insuficiente de sessões para este serviço no pacote.';
    END IF;

    -- 7. Inserir movimentação de consumo
    INSERT INTO package_session_movements (
        client_package_id,
        client_id,
        service_id,
        appointment_id,
        movement_type,
        sessions_count,
        description
    ) VALUES (
        p_client_package_id,
        p_client_id,
        p_service_id,
        p_appointment_id,
        'consume',
        1,
        'Baixa de sessão por atendimento concluído'
    );
END;
$$;

-- =========================================================================
-- 7. FUNÇÃO RPC TRANSACIONAL: LIBERAÇÃO APÓS PAGAMENTO CONFIRMADO
-- =========================================================================

CREATE OR REPLACE FUNCTION release_package_on_payment(
    p_order_id UUID,
    p_package_id UUID
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order_id UUID;
    v_client_id TEXT;
    v_payment_status TEXT;
    v_total_amount NUMERIC(10,2);
    v_package_name TEXT;
    v_validity_days INTEGER;
    v_client_package_id UUID;
BEGIN
    -- 0. Validação de Autenticação
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    -- 1. Consultar o pedido real na tabela 'orders' (sem confiar no frontend)
    SELECT id, user_id, payment_status, total_amount 
    INTO v_order_id, v_client_id, v_payment_status, v_total_amount
    FROM orders
    WHERE id = p_order_id;

    IF v_order_id IS NULL THEN
        RAISE EXCEPTION 'Pedido não encontrado.';
    END IF;

    -- 2. Confirmar que o pagamento está realmente aprovado ('pago' ou 'completed')
    IF v_payment_status IS NULL OR (v_payment_status <> 'pago' AND v_payment_status <> 'completed') THEN
        RAISE EXCEPTION 'O pedido não possui confirmação de pagamento válida.';
    END IF;

    -- 3. Validar autorização (apenas ADM ou o próprio cliente dono do pedido)
    IF NOT (
        v_client_id = auth.uid()::text OR
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    ) THEN
        RAISE EXCEPTION 'Acesso não autorizado para liberar este pacote.';
    END IF;

    -- 4. Verificar se a carteira para este pedido e pacote já foi liberada (Idempotência)
    SELECT id INTO v_client_package_id
    FROM client_packages
    WHERE order_id = p_order_id::text AND package_id = p_package_id;

    IF v_client_package_id IS NOT NULL THEN
        -- Já liberado anteriormente, retorna o ID existente sem duplicar receita ou carteira
        RETURN v_client_package_id;
    END IF;

    -- 5. Obter dados do pacote
    SELECT name, validity_days INTO v_package_name, v_validity_days
    FROM service_packages
    WHERE id = p_package_id AND is_active = true;

    IF v_package_name IS NULL THEN
        RAISE EXCEPTION 'Pacote não encontrado ou inativo.';
    END IF;

    -- 6. Criar a carteira do pacote da cliente
    INSERT INTO client_packages (
        client_id,
        package_id,
        package_name,
        order_id,
        total_paid,
        purchased_at,
        expires_at,
        status
    ) VALUES (
        v_client_id,
        p_package_id,
        v_package_name,
        p_order_id::text,
        COALESCE(v_total_amount, 0),
        NOW(),
        NOW() + (COALESCE(v_validity_days, 90) || ' days')::INTERVAL,
        'active'
    )
    RETURNING id INTO v_client_package_id;

    RETURN v_client_package_id;
END;
$$;

-- =========================================================================
-- 8. FUNÇÃO RPC TRANSACIONAL: REVERSÃO DE SESSÃO CONSUMIDA
-- =========================================================================

CREATE OR REPLACE FUNCTION revert_package_session(
    p_movement_id UUID,
    p_reason TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_orig_id UUID;
    v_client_package_id UUID;
    v_client_id TEXT;
    v_service_id TEXT;
    v_sessions_count INTEGER;
BEGIN
    -- 0. Validação de Autorização estrita (Apenas ADM ou Profissional)
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    IF NOT (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'professional'))
    ) THEN
        RAISE EXCEPTION 'Apenas administradores e profissionais podem reverter sessões de pacotes.';
    END IF;

    -- 1. Localizar o consumo original na tabela de movimentações com bloqueio
    SELECT id, client_package_id, client_id, service_id, sessions_count
    INTO v_orig_id, v_client_package_id, v_client_id, v_service_id, v_sessions_count
    FROM package_session_movements
    WHERE id = p_movement_id AND movement_type = 'consume'
    FOR UPDATE;

    IF v_orig_id IS NULL THEN
        RAISE EXCEPTION 'Movimento de consumo original não encontrado.';
    END IF;

    -- 2. Confirmar que o consumo ainda não foi revertido (Evitar estorno duplicado)
    IF EXISTS (
        SELECT 1 FROM package_session_movements 
        WHERE reverted_movement_id = p_movement_id 
          AND movement_type = 'revert'
    ) THEN
        RAISE EXCEPTION 'Esta sessão já foi revertida anteriormente.';
    END IF;

    -- 3. Inserir o movimento de reversão (restaurando o saldo atomicamente)
    INSERT INTO package_session_movements (
        client_package_id,
        client_id,
        service_id,
        movement_type,
        sessions_count,
        reverted_movement_id,
        description
    ) VALUES (
        v_client_package_id,
        v_client_id,
        v_service_id,
        'revert',
        v_sessions_count,
        p_movement_id,
        COALESCE(p_reason, 'Reversão de sessão por cancelamento/estorno do atendimento')
    );
END;
$$;
