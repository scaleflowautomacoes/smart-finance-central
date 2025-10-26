
-- Adicionar colunas para controlar transações recorrentes
ALTER TABLE public.transactions 
ADD COLUMN is_recorrente BOOLEAN DEFAULT FALSE,
ADD COLUMN recorrencia_tipo TEXT CHECK (recorrencia_tipo IN ('diaria', 'semanal', 'quinzenal', 'mensal', 'anual')),
ADD COLUMN recorrencia_total_ocorrencias INTEGER,
ADD COLUMN recorrencia_ocorrencia_atual INTEGER DEFAULT 1,
ADD COLUMN recorrencia_transacao_pai_id UUID REFERENCES public.transactions(id),
ADD COLUMN recorrencia_proxima_data DATE,
ADD COLUMN recorrencia_ativa BOOLEAN DEFAULT TRUE;

-- Criar índice para otimizar consultas de transações recorrentes
CREATE INDEX idx_transactions_recorrencia ON public.transactions(is_recorrente, recorrencia_ativa, recorrencia_proxima_data);

-- Função para gerar próximas transações recorrentes
CREATE OR REPLACE FUNCTION gerar_proximas_transacoes_recorrentes()
RETURNS void AS $$
DECLARE
    transacao_rec RECORD;
    nova_data DATE;
    i INTEGER;
BEGIN
    -- Buscar transações recorrentes ativas que precisam de novas ocorrências
    FOR transacao_rec IN 
        SELECT * FROM transactions 
        WHERE is_recorrente = TRUE 
        AND recorrencia_ativa = TRUE 
        AND recorrencia_ocorrencia_atual < recorrencia_total_ocorrencias
        AND deletado = FALSE
    LOOP
        -- Gerar as próximas transações baseadas no tipo de recorrência
        FOR i IN (transacao_rec.recorrencia_ocorrencia_atual + 1)..transacao_rec.recorrencia_total_ocorrencias LOOP
            -- Calcular a próxima data baseada no tipo de recorrência
            nova_data := CASE transacao_rec.recorrencia_tipo
                WHEN 'diaria' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 day'
                WHEN 'semanal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 week'  
                WHEN 'quinzenal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '2 weeks'
                WHEN 'mensal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 month'
                WHEN 'anual' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 year'
            END;
            
            -- Inserir nova transação recorrente
            INSERT INTO transactions (
                nome, tipo, valor, data, origem, forma_pagamento, status,
                cliente_id, categoria_id, subcategoria_id, dependencia, recorrencia,
                observacoes, is_recorrente, recorrencia_tipo, recorrencia_total_ocorrencias,
                recorrencia_ocorrencia_atual, recorrencia_transacao_pai_id, recorrencia_ativa,
                deletado
            ) VALUES (
                transacao_rec.nome || ' (' || i || '/' || transacao_rec.recorrencia_total_ocorrencias || ')',
                transacao_rec.tipo, transacao_rec.valor, nova_data, transacao_rec.origem,
                transacao_rec.forma_pagamento, 'prevista', transacao_rec.cliente_id,
                transacao_rec.categoria_id, transacao_rec.subcategoria_id, transacao_rec.dependencia,
                transacao_rec.recorrencia, transacao_rec.observacoes, FALSE, NULL, NULL,
                NULL, transacao_rec.id, TRUE, FALSE
            );
        END LOOP;
        
        -- Marcar a transação pai como processada
        UPDATE transactions 
        SET recorrencia_ocorrencia_atual = recorrencia_total_ocorrencias
        WHERE id = transacao_rec.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
