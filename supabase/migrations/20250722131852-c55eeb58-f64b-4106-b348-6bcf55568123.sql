
-- Limpar dados inconsistentes de recorrência
UPDATE transactions 
SET recorrencia_ocorrencia_atual = 1 
WHERE is_recorrente = TRUE 
AND recorrencia_ocorrencia_atual IS NULL;

-- Corrigir função de geração de transações recorrentes
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
    ocorrencias_existentes INTEGER;
BEGIN
    -- Buscar transações recorrentes ativas que precisam de novas ocorrências
    FOR transacao_rec IN 
        SELECT * FROM transactions 
        WHERE is_recorrente = TRUE 
        AND recorrencia_ativa = TRUE 
        AND recorrencia_total_ocorrencias > 1
        AND deletado = FALSE
        AND recorrencia_transacao_pai_id IS NULL -- Apenas transações pai
    LOOP
        -- Contar quantas ocorrências já existem (incluindo a transação pai)
        SELECT COUNT(*) INTO ocorrencias_existentes
        FROM transactions 
        WHERE (id = transacao_rec.id OR recorrencia_transacao_pai_id = transacao_rec.id)
        AND deletado = FALSE;
        
        -- Se já temos todas as ocorrências, pular
        IF ocorrencias_existentes >= transacao_rec.recorrencia_total_ocorrencias THEN
            CONTINUE;
        END IF;
        
        -- Gerar as ocorrências faltantes
        FOR i IN (ocorrencias_existentes + 1)..transacao_rec.recorrencia_total_ocorrencias LOOP
            -- Calcular a próxima data baseada no tipo de recorrência
            nova_data := CASE transacao_rec.recorrencia_tipo
                WHEN 'diaria' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 day'
                WHEN 'semanal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 week'  
                WHEN 'quinzenal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '2 weeks'
                WHEN 'mensal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 month'
                WHEN 'anual' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 year'
                ELSE transacao_rec.data::DATE + (i - 1) * INTERVAL '1 month' -- Default mensal
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
                    transacao_rec.forma_pagamento, 
                    CASE WHEN nova_data <= CURRENT_DATE THEN 'vencida' ELSE 'prevista' END,
                    transacao_rec.cliente_id, transacao_rec.categoria_id, transacao_rec.subcategoria_id, 
                    transacao_rec.dependencia, transacao_rec.recorrencia, transacao_rec.observacoes, 
                    FALSE, NULL, NULL, NULL, transacao_rec.id, TRUE, FALSE
                );
                
                RAISE LOG 'Criada transação recorrente: % para data %', transacao_rec.nome, nova_data;
            END IF;
        END LOOP;
        
        -- Atualizar a transação pai
        UPDATE transactions 
        SET recorrencia_ocorrencia_atual = transacao_rec.recorrencia_total_ocorrencias
        WHERE id = transacao_rec.id;
        
    END LOOP;
    
    RAISE LOG 'Função gerar_proximas_transacoes_recorrentes executada com sucesso';
END;
$$;

-- Executar a função corrigida para gerar todas as recorrências
SELECT gerar_proximas_transacoes_recorrentes();

-- Criar função para calcular alertas de caixa
CREATE OR REPLACE FUNCTION calcular_alertas_caixa(
    p_data_inicio DATE DEFAULT CURRENT_DATE,
    p_data_fim DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month')
)
RETURNS TABLE (
    workspace TEXT,
    total_entradas_previstas NUMERIC,
    total_saidas_previstas NUMERIC,
    deficit NUMERIC,
    proxima_data_vencimento DATE,
    total_vencimentos_proximos NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH dados_workspace AS (
        SELECT 
            t.origem,
            SUM(CASE WHEN t.tipo = 'entrada' AND t.status IN ('prevista', 'vencida') THEN t.valor ELSE 0 END) as entradas_previstas,
            SUM(CASE WHEN t.tipo = 'saida' AND t.status IN ('prevista', 'vencida') THEN t.valor ELSE 0 END) as saidas_previstas,
            MIN(CASE WHEN t.tipo = 'saida' AND t.status IN ('prevista', 'vencida') AND t.data >= p_data_inicio THEN t.data END) as proxima_saida
        FROM transactions t
        WHERE t.deletado = FALSE
        AND t.data BETWEEN p_data_inicio AND p_data_fim
        AND t.recorrencia_ativa != FALSE
        GROUP BY t.origem
    ),
    vencimentos_proximos AS (
        SELECT 
            t.origem,
            SUM(t.valor) as total_vencimentos
        FROM transactions t
        WHERE t.deletado = FALSE
        AND t.tipo = 'saida'
        AND t.status IN ('prevista', 'vencida')
        AND t.data BETWEEN p_data_inicio AND (p_data_inicio + INTERVAL '10 days')
        AND t.recorrencia_ativa != FALSE
        GROUP BY t.origem
    )
    SELECT 
        dw.origem::TEXT,
        dw.entradas_previstas,
        dw.saidas_previstas,
        (dw.saidas_previstas - dw.entradas_previstas) as deficit,
        dw.proxima_saida,
        COALESCE(vp.total_vencimentos, 0)
    FROM dados_workspace dw
    LEFT JOIN vencimentos_proximos vp ON dw.origem = vp.origem;
END;
$$;
