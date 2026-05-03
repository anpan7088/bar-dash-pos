-- Allow managers/admins to view, update, delete all profiles
CREATE POLICY "Managers can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

-- Allow anon (PIN-based POS sessions) to view all profiles for staff management
CREATE POLICY "Anon can view all profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon can update profiles"
ON public.profiles
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Anon can delete profiles"
ON public.profiles
FOR DELETE
TO anon
USING (true);