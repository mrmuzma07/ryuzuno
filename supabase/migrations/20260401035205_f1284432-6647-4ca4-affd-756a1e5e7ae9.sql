
-- Admins can manage learning_path_courses
CREATE POLICY "Admins manage LP courses"
ON public.learning_path_courses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can view all enrollments
CREATE POLICY "Admins view all enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage user_badges
CREATE POLICY "Admins manage user badges"
ON public.user_badges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete courses (already exists), update all courses (already exists via Teachers policy)
-- Admins can manage all enrollments (update/delete)
CREATE POLICY "Admins update enrollments"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete enrollments"
ON public.enrollments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
