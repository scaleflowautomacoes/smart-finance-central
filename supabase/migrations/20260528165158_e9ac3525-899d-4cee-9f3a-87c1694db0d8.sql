GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon, authenticated;
GRANT ALL ON public.transactions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.responsaveis TO anon, authenticated;
GRANT ALL ON public.responsaveis TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO anon, authenticated;
GRANT ALL ON public.debts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO anon, authenticated;
GRANT ALL ON public.goals TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO anon, authenticated;
GRANT ALL ON public.investments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO anon, authenticated;
GRANT ALL ON public.vehicles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenances TO anon, authenticated;
GRANT ALL ON public.maintenances TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;