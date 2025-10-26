-- Fase 1: Correção de segurança e reestruturação

-- 1.1 Corrigir search_path das funções existentes
CREATE OR REPLACE FUNCTION public.claim_unowned_transactions()
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  WITH updated AS (
    UPDATE public.transactions
    SET user_id = auth.uid()
    WHERE user_id IS NULL
    RETURNING 1
  )
  SELECT COUNT(*) FROM updated;
$function$;

CREATE OR REPLACE FUNCTION public.set_transactions_user_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.gerenciar_recorrencia(p_transacao_pai_id uuid, p_acao text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    IF p_acao = 'pausar' THEN
        UPDATE transactions 
        SET recorrencia_ativa = FALSE 
        WHERE id = p_transacao_pai_id OR recorrencia_transacao_pai_id = p_transacao_pai_id;
        
    ELSIF p_acao = 'reativar' THEN
        UPDATE transactions 
        SET recorrencia_ativa = TRUE 
        WHERE (id = p_transacao_pai_id OR recorrencia_transacao_pai_id = p_transacao_pai_id)
        AND data >= CURRENT_DATE;
        
    ELSIF p_acao = 'cancelar' THEN
        UPDATE transactions 
        SET status = 'cancelada', recorrencia_ativa = FALSE
        WHERE recorrencia_transacao_pai_id = p_transacao_pai_id 
        AND status = 'prevista';
        
        UPDATE transactions 
        SET recorrencia_ativa = FALSE 
        WHERE id = p_transacao_pai_id;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.gerar_proximas_transacoes_recorrentes()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    transacao_rec RECORD;
    nova_data DATE;
    i INTEGER;
    ocorrencias_existentes INTEGER;
BEGIN
    FOR transacao_rec IN 
        SELECT * FROM transactions 
        WHERE is_recorrente = TRUE 
        AND recorrencia_ativa = TRUE 
        AND recorrencia_total_ocorrencias > 1
        AND deletado = FALSE
        AND recorrencia_transacao_pai_id IS NULL
    LOOP
        SELECT COUNT(*) INTO ocorrencias_existentes
        FROM transactions 
        WHERE (id = transacao_rec.id OR recorrencia_transacao_pai_id = transacao_rec.id)
        AND deletado = FALSE;
        
        IF ocorrencias_existentes >= transacao_rec.recorrencia_total_ocorrencias THEN
            CONTINUE;
        END IF;
        
        FOR i IN (ocorrencias_existentes + 1)..transacao_rec.recorrencia_total_ocorrencias LOOP
            nova_data := CASE transacao_rec.recorrencia_tipo
                WHEN 'diaria' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 day'
                WHEN 'semanal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 week'  
                WHEN 'quinzenal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '2 weeks'
                WHEN 'mensal' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 month'
                WHEN 'anual' THEN transacao_rec.data::DATE + (i - 1) * INTERVAL '1 year'
                ELSE transacao_rec.data::DATE + (i - 1) * INTERVAL '1 month'
            END;
            
            IF NOT EXISTS (
                SELECT 1 FROM transactions 
                WHERE recorrencia_transacao_pai_id = transacao_rec.id 
                AND data = nova_data
                AND deletado = FALSE
            ) THEN
                INSERT INTO transactions (
                    nome, tipo, valor, data, origem, forma_pagamento, status,
                    cliente_id, categoria_id, subcategoria_id, dependencia, recorrencia,
                    observacoes, is_recorrente, recorrencia_tipo, recorrencia_total_ocorrencias,
                    recorrencia_ocorrencia_atual, recorrencia_transacao_pai_id, recorrencia_ativa,
                    deletado, user_id
                ) VALUES (
                    transacao_rec.nome || ' (' || i || '/' || transacao_rec.recorrencia_total_ocorrencias || ')',
                    transacao_rec.tipo, transacao_rec.valor, nova_data, transacao_rec.origem,
                    transacao_rec.forma_pagamento, 
                    CASE WHEN nova_data <= CURRENT_DATE THEN 'vencida' ELSE 'prevista' END,
                    transacao_rec.cliente_id, transacao_rec.categoria_id, transacao_rec.subcategoria_id, 
                    transacao_rec.dependencia, transacao_rec.recorrencia, transacao_rec.observacoes, 
                    FALSE, NULL, NULL, NULL, transacao_rec.id, TRUE, FALSE, transacao_rec.user_id
                );
            END IF;
        END LOOP;
        
        UPDATE transactions 
        SET recorrencia_ocorrencia_atual = transacao_rec.recorrencia_total_ocorrencias
        WHERE id = transacao_rec.id;
        
    END LOOP;
END;
$function$;

-- 1.2 Renomear tabela clients para responsaveis
ALTER TABLE public.clients RENAME TO responsaveis;

-- 1.3 Adicionar políticas RLS para responsaveis
CREATE POLICY "Authenticated can update responsaveis" 
ON public.responsaveis 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated can delete responsaveis" 
ON public.responsaveis 
FOR DELETE 
USING (true);

-- 1.4 Adicionar políticas RLS para categories
CREATE POLICY "Authenticated can update categories" 
ON public.categories 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated can delete categories" 
ON public.categories 
FOR DELETE 
USING (true);