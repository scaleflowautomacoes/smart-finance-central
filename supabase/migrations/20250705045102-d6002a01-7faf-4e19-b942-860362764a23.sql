
-- Corrigir a função de geração de transações recorrentes
DROP FUNCTION IF EXISTS gerar_proximas_transacoes_recorrentes();

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
                WHEN 'diaria' THEN transacao_rec.data::DATE + (i - transacao_rec.recorrencia_ocorrencia_atual) * INTERVAL '1 day'
                WHEN 'semanal' THEN transacao_rec.data::DATE + (i - transacao_rec.recorrencia_ocorrencia_atual) * INTERVAL '1 week'  
                WHEN 'quinzenal' THEN transacao_rec.data::DATE + (i - transacao_rec.recorrencia_ocorrencia_atual) * INTERVAL '2 weeks'
                WHEN 'mensal' THEN transacao_rec.data::DATE + (i - transacao_rec.recorrencia_ocorrencia_atual) * INTERVAL '1 month'
                WHEN 'anual' THEN transacao_rec.data::DATE + (i - transacao_rec.recorrencia_ocorrencia_atual) * INTERVAL '1 year'
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

-- Criar trigger para executar automaticamente após inserir transação recorrente
CREATE OR REPLACE FUNCTION trigger_gerar_recorrentes()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for uma transação recorrente nova, gerar as futuras imediatamente
    IF NEW.is_recorrente = TRUE AND NEW.recorrencia_total_ocorrencias > 1 THEN
        -- Executar a função de geração em background
        PERFORM gerar_proximas_transacoes_recorrentes();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_recorrencia_insert ON transactions;
CREATE TRIGGER trigger_recorrencia_insert
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_gerar_recorrentes();

-- Função para cancelar/pausar recorrências
CREATE OR REPLACE FUNCTION gerenciar_recorrencia(
    p_transacao_pai_id UUID,
    p_acao TEXT -- 'pausar', 'reativar', 'cancelar'
)
RETURNS void AS $$
BEGIN
    IF p_acao = 'pausar' THEN
        -- Pausar transação pai e futuras
        UPDATE transactions 
        SET recorrencia_ativa = FALSE 
        WHERE id = p_transacao_pai_id OR recorrencia_transacao_pai_id = p_transacao_pai_id;
        
    ELSIF p_acao = 'reativar' THEN
        -- Reativar apenas transações não vencidas
        UPDATE transactions 
        SET recorrencia_ativa = TRUE 
        WHERE (id = p_transacao_pai_id OR recorrencia_transacao_pai_id = p_transacao_pai_id)
        AND data >= CURRENT_DATE;
        
    ELSIF p_acao = 'cancelar' THEN
        -- Cancelar transações futuras (não realizadas)
        UPDATE transactions 
        SET status = 'cancelada', recorrencia_ativa = FALSE
        WHERE recorrencia_transacao_pai_id = p_transacao_pai_id 
        AND status = 'prevista';
        
        -- Desativar transação pai
        UPDATE transactions 
        SET recorrencia_ativa = FALSE 
        WHERE id = p_transacao_pai_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
