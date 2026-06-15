-- =========== BANK STATEMENT IMPORTS ==========
CREATE TABLE public.bank_statement_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace TEXT NOT NULL DEFAULT 'PJ',
  source_type TEXT NOT NULL DEFAULT 'pdf',
  source_name TEXT NOT NULL,
  source_hash TEXT NOT NULL UNIQUE,
  account_holder TEXT,
  account_document TEXT,
  account_bank TEXT,
  period_start DATE,
  period_end DATE,
  statement_currency TEXT NOT NULL DEFAULT 'BRL',
  total_entries NUMERIC NOT NULL DEFAULT 0,
  total_exits NUMERIC NOT NULL DEFAULT 0,
  final_balance NUMERIC NOT NULL DEFAULT 0,
  page_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'parsed',
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bank_statement_imports_workspace ON public.bank_statement_imports(workspace, imported_at DESC);
CREATE INDEX idx_bank_statement_imports_period ON public.bank_statement_imports(period_start, period_end);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_statement_imports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_statement_imports TO authenticated;
GRANT ALL ON public.bank_statement_imports TO service_role;

ALTER TABLE public.bank_statement_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all bank statement imports" ON public.bank_statement_imports FOR ALL USING (true) WITH CHECK (true);

-- =========== BANK STATEMENT ENTRIES ==========
CREATE TABLE public.bank_statement_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_id UUID NOT NULL REFERENCES public.bank_statement_imports(id) ON DELETE CASCADE,
  workspace TEXT NOT NULL DEFAULT 'PJ',
  statement_date DATE NOT NULL,
  page_number INTEGER NOT NULL DEFAULT 1,
  line_index INTEGER NOT NULL DEFAULT 0,
  direction TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  description TEXT NOT NULL,
  counterparty_name TEXT,
  counterparty_document TEXT,
  counterparty_bank TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  running_balance NUMERIC,
  raw_text TEXT NOT NULL,
  raw_hash TEXT NOT NULL UNIQUE,
  suggested_category TEXT,
  final_category_id UUID,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'suggested',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bank_statement_entries_import_id ON public.bank_statement_entries(import_id);
CREATE INDEX idx_bank_statement_entries_workspace_date ON public.bank_statement_entries(workspace, statement_date DESC);
CREATE INDEX idx_bank_statement_entries_raw_hash ON public.bank_statement_entries(raw_hash);
CREATE INDEX idx_bank_statement_entries_transaction_id ON public.bank_statement_entries(transaction_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_statement_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_statement_entries TO authenticated;
GRANT ALL ON public.bank_statement_entries TO service_role;

ALTER TABLE public.bank_statement_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open all bank statement entries" ON public.bank_statement_entries FOR ALL USING (true) WITH CHECK (true);
