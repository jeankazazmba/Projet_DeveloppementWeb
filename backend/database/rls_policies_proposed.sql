-- PROPOSITION À EXAMINER AVEC CALEB AVANT EXÉCUTION.
-- Vérifier les noms exacts des schémas/tables, les rôles Postgres et les politiques existantes.
-- Ces règles autorisent uniquement la lecture de sa propre ligne.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_assignments_select_own"
ON public.staff_assignments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ne pas exécuter en doublon si des politiques équivalentes existent déjà.
-- Aucune politique d'écriture n'est créée ici.
