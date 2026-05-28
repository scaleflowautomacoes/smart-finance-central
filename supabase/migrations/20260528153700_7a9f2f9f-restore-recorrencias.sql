CREATE OR REPLACE FUNCTION public.gerar_proximas_transacoes_recorrentes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  parent_tx RECORD;
  next_date DATE;
  occurrence_index INTEGER;
  existing_occurrences INTEGER;
BEGIN
  FOR parent_tx IN
    SELECT *
    FROM public.transactions
    WHERE is_recorrente = true
      AND deletado = false
      AND recorrencia_transacao_pai_id IS NULL
      AND COALESCE(recorrencia_ativa, true) = true
      AND COALESCE(recorrencia_total_ocorrencias, 0) > 1
  LOOP
    SELECT COUNT(*)
      INTO existing_occurrences
      FROM public.transactions
     WHERE (id = parent_tx.id OR recorrencia_transacao_pai_id = parent_tx.id)
       AND deletado = false;

    IF existing_occurrences = 0 THEN
      existing_occurrences := 1;
    END IF;

    IF existing_occurrences >= parent_tx.recorrencia_total_ocorrencias THEN
      UPDATE public.transactions
         SET recorrencia_ocorrencia_atual = parent_tx.recorrencia_total_ocorrencias,
             updated_at = now()
       WHERE id = parent_tx.id;
      CONTINUE;
    END IF;

    FOR occurrence_index IN (existing_occurrences + 1)..parent_tx.recorrencia_total_ocorrencias LOOP
      next_date := CASE parent_tx.recorrencia_tipo
        WHEN 'diaria' THEN (parent_tx.data::date + (occurrence_index - 1) * INTERVAL '1 day')::date
        WHEN 'semanal' THEN (parent_tx.data::date + (occurrence_index - 1) * INTERVAL '1 week')::date
        WHEN 'quinzenal' THEN (parent_tx.data::date + (occurrence_index - 1) * INTERVAL '2 weeks')::date
        WHEN 'mensal' THEN (parent_tx.data::date + (occurrence_index - 1) * INTERVAL '1 month')::date
        WHEN 'anual' THEN (parent_tx.data::date + (occurrence_index - 1) * INTERVAL '1 year')::date
        ELSE (parent_tx.data::date + (occurrence_index - 1) * INTERVAL '1 month')::date
      END;

      IF NOT EXISTS (
        SELECT 1
          FROM public.transactions
         WHERE recorrencia_transacao_pai_id = parent_tx.id
           AND data = next_date
           AND deletado = false
      ) THEN
        INSERT INTO public.transactions (
          nome,
          tipo,
          valor,
          data,
          origem,
          forma_pagamento,
          status,
          cliente_id,
          categoria_id,
          subcategoria_id,
          dependencia,
          recorrencia,
          observacoes,
          is_recorrente,
          recorrencia_tipo,
          recorrencia_total_ocorrencias,
          recorrencia_ocorrencia_atual,
          recorrencia_transacao_pai_id,
          recorrencia_ativa,
          deletado,
          user_id
        )
        VALUES (
          parent_tx.nome || ' (' || occurrence_index || '/' || parent_tx.recorrencia_total_ocorrencias || ')',
          parent_tx.tipo,
          parent_tx.valor,
          next_date,
          parent_tx.origem,
          parent_tx.forma_pagamento,
          CASE WHEN next_date <= CURRENT_DATE THEN 'vencida' ELSE 'prevista' END,
          parent_tx.cliente_id,
          parent_tx.categoria_id,
          parent_tx.subcategoria_id,
          parent_tx.dependencia,
          parent_tx.recorrencia,
          parent_tx.observacoes,
          false,
          null,
          null,
          null,
          parent_tx.id,
          true,
          false,
          parent_tx.user_id
        );
      END IF;
    END LOOP;

    UPDATE public.transactions
       SET recorrencia_ocorrencia_atual = parent_tx.recorrencia_total_ocorrencias,
           updated_at = now()
     WHERE id = parent_tx.id;
  END LOOP;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.gerar_proximas_transacoes_recorrentes() TO anon, authenticated, service_role;
