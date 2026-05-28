CREATE OR REPLACE FUNCTION public.gerenciar_recorrencia(
  p_transacao_pai_id UUID,
  p_acao TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_acao = 'pausar' THEN
    UPDATE public.transactions
      SET recorrencia_ativa = false
      WHERE (id = p_transacao_pai_id OR recorrencia_transacao_pai_id = p_transacao_pai_id)
        AND deletado = false;
  ELSIF p_acao = 'reativar' THEN
    UPDATE public.transactions
      SET recorrencia_ativa = true
      WHERE (id = p_transacao_pai_id OR recorrencia_transacao_pai_id = p_transacao_pai_id)
        AND deletado = false
        AND status <> 'cancelada';
  ELSIF p_acao = 'cancelar' THEN
    UPDATE public.transactions
      SET recorrencia_ativa = false
      WHERE id = p_transacao_pai_id
        AND deletado = false;

    UPDATE public.transactions
      SET recorrencia_ativa = false,
          status = 'cancelada'
      WHERE recorrencia_transacao_pai_id = p_transacao_pai_id
        AND deletado = false
        AND status = 'prevista';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancelar_recorrencias_em_lote(
  p_transacao_pai_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_transacao_pai_ids IS NULL OR array_length(p_transacao_pai_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.transactions
    SET recorrencia_ativa = false
    WHERE id = ANY(p_transacao_pai_ids)
      AND deletado = false;

  UPDATE public.transactions
    SET recorrencia_ativa = false,
        status = 'cancelada'
    WHERE recorrencia_transacao_pai_id = ANY(p_transacao_pai_ids)
      AND deletado = false
      AND status = 'prevista';
END;
$$;

GRANT EXECUTE ON FUNCTION public.gerenciar_recorrencia(UUID, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancelar_recorrencias_em_lote(UUID[]) TO anon, authenticated, service_role;
