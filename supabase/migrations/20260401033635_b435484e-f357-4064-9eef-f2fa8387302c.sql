-- Allow teachers to view enrollments for their courses
CREATE POLICY "Teachers view enrollments for own courses"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = enrollments.course_id
    AND courses.teacher_id = auth.uid()
  )
);

-- Allow teachers to view reviews for their courses
CREATE POLICY "Teachers view reviews for own courses"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = reviews.course_id
    AND courses.teacher_id = auth.uid()
  )
);
