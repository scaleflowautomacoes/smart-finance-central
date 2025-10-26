-- Corrigir as funções restantes com search_path

CREATE OR REPLACE FUNCTION public.trigger_gerar_recorrentes()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    IF NEW.is_recorrente = TRUE AND NEW.recorrencia_total_ocorrencias > 1 THEN
        PERFORM gerar_proximas_transacoes_recorrentes();
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calcular_alertas_caixa(p_data_inicio date DEFAULT CURRENT_DATE, p_data_fim date DEFAULT (CURRENT_DATE + '1 mon'::interval))
 RETURNS TABLE(workspace text, total_entradas_previstas numeric, total_saidas_previstas numeric, deficit numeric, proxima_data_vencimento date, total_vencimentos_proximos numeric)
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
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
$function$;