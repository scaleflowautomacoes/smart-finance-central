
-- Corrigir a função de geração com SECURITY DEFINER para ter permissões adequadas
DROP FUNCTION IF EXISTS gerar_proximas_transacoes_recorrentes();

CREATE OR REPLACE FUNCTION gerar_proximas_transacoes_recorrentes()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
        AND (recorrencia_ocorrencia_atual IS NULL OR recorrencia_ocorrencia_atual < recorrencia_total_ocorrencias)
        AND deletado = FALSE
    LOOP
        -- Definir ocorrência atual se for NULL
        IF transacao_rec.recorrencia_ocorrencia_atual IS NULL THEN
            UPDATE transactions 
            SET recorrencia_ocorrencia_atual = 1 
            WHERE id = transacao_rec.id;
            transacao_rec.recorrencia_ocorrencia_atual := 1;
        END IF;

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
            
            -- Verificar se a transação já existe para evitar duplicatas
            IF NOT EXISTS (
                SELECT 1 FROM transactions 
                WHERE recorrencia_transacao_pai_id = transacao_rec.id 
                AND data = nova_data
                AND deletado = FALSE
            ) THEN
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
            END IF;
        END LOOP;
        
        -- Marcar a transação pai como processada
        UPDATE transactions 
        SET recorrencia_ocorrencia_atual = recorrencia_total_ocorrencias
        WHERE id = transacao_rec.id;
    END LOOP;
END;
$$;

-- Executar a função para gerar transações recorrentes faltantes
SELECT gerar_proximas_transacoes_recorrentes();

-- Atualizar transações existentes que deveriam ser recorrentes
-- (caso existam padrões que possam ser identificados)
UPDATE transactions 
SET is_recorrente = TRUE,
    recorrencia_tipo = 'mensal',
    recorrencia_total_ocorrencias = 12,
    recorrencia_ocorrencia_atual = 1,
    recorrencia_ativa = TRUE
WHERE nome ILIKE '%mensalidade%' 
   OR nome ILIKE '%fee mensal%'
   OR nome ILIKE '%assinatura%'
   AND is_recorrente IS NOT TRUE;

-- Executar novamente para gerar as recorrências das transações atualizadas
SELECT gerar_proximas_transacoes_recorrentes();
