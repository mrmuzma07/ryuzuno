
-- Add learning_objectives to courses
ALTER TABLE public.courses ADD COLUMN learning_objectives jsonb DEFAULT '[]'::jsonb;

-- Create coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  discount_percent integer NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_discount CHECK (discount_percent >= 0 AND discount_percent <= 100 AND discount_amount >= 0)
);

-- Unique code per course (null course_id = global coupon)
CREATE UNIQUE INDEX coupons_code_course_idx ON public.coupons (code, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'));

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Coupons are publicly readable (for validation)
CREATE POLICY "Coupons are publicly readable" ON public.coupons FOR SELECT TO public USING (true);

-- Teachers manage coupons for their own courses
CREATE POLICY "Teachers manage own course coupons" ON public.coupons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = coupons.course_id AND c.teacher_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM courses c WHERE c.id = coupons.course_id AND c.teacher_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Admins manage all coupons
CREATE POLICY "Admins manage all coupons" ON public.coupons FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to update used_count (for redemption)
CREATE POLICY "Users can increment coupon usage" ON public.coupons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
