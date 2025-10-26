-- Fase 1: Ajustar políticas RLS para acesso público temporário
-- ATENÇÃO: Isso é temporário até implementar autenticação!

-- Dropar políticas antigas de categories
DROP POLICY IF EXISTS "Authenticated can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated can read categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated can update categories" ON public.categories;

-- Criar políticas públicas para categories
CREATE POLICY "Public can read categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Public can insert categories"
ON public.categories FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update categories"
ON public.categories FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete categories"
ON public.categories FOR DELETE
USING (true);

-- Dropar políticas antigas de responsaveis
DROP POLICY IF EXISTS "Authenticated can delete responsaveis" ON public.responsaveis;
DROP POLICY IF EXISTS "Authenticated can insert clients" ON public.responsaveis;
DROP POLICY IF EXISTS "Authenticated can read clients" ON public.responsaveis;
DROP POLICY IF EXISTS "Authenticated can update responsaveis" ON public.responsaveis;

-- Criar políticas públicas para responsaveis
CREATE POLICY "Public can read responsaveis"
ON public.responsaveis FOR SELECT
USING (true);

CREATE POLICY "Public can insert responsaveis"
ON public.responsaveis FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update responsaveis"
ON public.responsaveis FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete responsaveis"
ON public.responsaveis FOR DELETE
USING (true);