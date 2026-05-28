
-- =========== TRANSACTIONS ===========
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  data DATE NOT NULL,
  origem TEXT NOT NULL,
  forma_pagamento TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'prevista',
  cliente_id UUID,
  categoria_id UUID,
  subcategoria_id UUID,
  dependencia TEXT,
  recorrencia TEXT,
  observacoes TEXT,
  deletado BOOLEAN NOT NULL DEFAULT false,
  is_recorrente BOOLEAN NOT NULL DEFAULT false,
  recorrencia_tipo TEXT,
  recorrencia_total_ocorrencias INTEGER,
  recorrencia_ocorrencia_atual INTEGER,
  recorrencia_transacao_pai_id UUID,
  recorrencia_proxima_data DATE,
  recorrencia_ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open read transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Open insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Open update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Open delete transactions" ON public.transactions FOR DELETE USING (true);

-- =========== CATEGORIES ===========
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  origem TEXT NOT NULL,
  tipo TEXT NOT NULL,
  limite_mensal NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- =========== RESPONSAVEIS ===========
CREATE TABLE public.responsaveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'avulso',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.responsaveis TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.responsaveis TO authenticated;
GRANT ALL ON public.responsaveis TO service_role;
ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all responsaveis" ON public.responsaveis FOR ALL USING (true) WITH CHECK (true);

-- =========== DEBTS ===========
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace TEXT NOT NULL DEFAULT 'PF',
  name TEXT NOT NULL,
  creditor TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  installments_total INTEGER NOT NULL DEFAULT 1,
  installments_paid INTEGER NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  payment_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO authenticated;
GRANT ALL ON public.debts TO service_role;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all debts" ON public.debts FOR ALL USING (true) WITH CHECK (true);

-- =========== GOALS ===========
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace TEXT NOT NULL DEFAULT 'PF',
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  deadline DATE NOT NULL,
  category_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  type TEXT NOT NULL DEFAULT 'saving',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);

-- =========== INVESTMENTS ===========
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace TEXT NOT NULL DEFAULT 'PF',
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  initial_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  purchase_date DATE NOT NULL,
  expected_return NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all investments" ON public.investments FOR ALL USING (true) WITH CHECK (true);

-- =========== VEHICLES ===========
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace TEXT NOT NULL DEFAULT 'PF',
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  plate TEXT,
  current_km INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

-- =========== MAINTENANCES ===========
CREATE TABLE public.maintenances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  km_performed INTEGER NOT NULL DEFAULT 0,
  next_km INTEGER,
  date_performed DATE NOT NULL,
  next_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenances TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenances TO authenticated;
GRANT ALL ON public.maintenances TO service_role;
ALTER TABLE public.maintenances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all maintenances" ON public.maintenances FOR ALL USING (true) WITH CHECK (true);

-- =========== RPC: claim_unowned_transactions (no-op no novo backend) ===========
CREATE OR REPLACE FUNCTION public.claim_unowned_transactions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 0;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_unowned_transactions() TO anon, authenticated, service_role;

-- =========== RPC: gerar_proximas_transacoes_recorrentes (placeholder) ===========
CREATE OR REPLACE FUNCTION public.gerar_proximas_transacoes_recorrentes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Placeholder: lógica de geração de recorrências pode ser implementada futuramente
  RETURN;
END;
$$;
GRANT EXECUTE ON FUNCTION public.gerar_proximas_transacoes_recorrentes() TO anon, authenticated, service_role;

-- =========== RPC: gerenciar_recorrencia ===========
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
      WHERE id = p_transacao_pai_id
         OR recorrencia_transacao_pai_id = p_transacao_pai_id;
  ELSIF p_acao = 'reativar' THEN
    UPDATE public.transactions
      SET recorrencia_ativa = true
      WHERE id = p_transacao_pai_id
         OR recorrencia_transacao_pai_id = p_transacao_pai_id;
  ELSIF p_acao = 'cancelar' THEN
    UPDATE public.transactions
      SET deletado = true, recorrencia_ativa = false
      WHERE id = p_transacao_pai_id
         OR recorrencia_transacao_pai_id = p_transacao_pai_id;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.gerenciar_recorrencia(UUID, TEXT) TO anon, authenticated, service_role;

-- Realtime para transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
