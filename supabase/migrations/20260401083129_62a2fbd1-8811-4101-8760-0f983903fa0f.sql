
-- Storage bucket for lesson attachments & assignment submissions
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-files', 'lesson-files', true);

CREATE POLICY "Authenticated upload lesson files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-files');
CREATE POLICY "Public view lesson files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'lesson-files');
CREATE POLICY "Users update own lesson files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lesson-files');
CREATE POLICY "Users delete own lesson files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'lesson-files');

-- Lesson attachments (downloadable materials)
CREATE TABLE public.lesson_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attachments viewable with lesson" ON public.lesson_attachments FOR SELECT TO public USING (true);
CREATE POLICY "Teachers manage attachments" ON public.lesson_attachments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM lessons l JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE l.id = lesson_attachments.lesson_id AND c.teacher_id = auth.uid())
);

-- Quizzes
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  passing_score integer NOT NULL DEFAULT 70,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quizzes viewable publicly" ON public.quizzes FOR SELECT TO public USING (true);
CREATE POLICY "Teachers manage quizzes" ON public.quizzes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM lessons l JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE l.id = quizzes.lesson_id AND c.teacher_id = auth.uid())
);

-- Quiz questions (options stored as JSONB array [{text: "...", is_correct: bool}])
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions viewable publicly" ON public.quiz_questions FOR SELECT TO public USING (true);
CREATE POLICY "Teachers manage questions" ON public.quiz_questions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM quizzes q JOIN lessons l ON l.id = q.lesson_id JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE q.id = quiz_questions.quiz_id AND c.teacher_id = auth.uid())
);

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teachers view attempts for own courses" ON public.quiz_attempts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM quizzes q JOIN lessons l ON l.id = q.lesson_id JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE q.id = quiz_attempts.quiz_id AND c.teacher_id = auth.uid())
);

-- Coding exercises
CREATE TABLE public.coding_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  starter_code text DEFAULT '',
  language text NOT NULL DEFAULT 'javascript',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coding_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises viewable publicly" ON public.coding_exercises FOR SELECT TO public USING (true);
CREATE POLICY "Teachers manage exercises" ON public.coding_exercises FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM lessons l JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE l.id = coding_exercises.lesson_id AND c.teacher_id = auth.uid())
);

-- Coding submissions
CREATE TABLE public.coding_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES public.coding_exercises(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  code text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own coding submissions" ON public.coding_submissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert coding submissions" ON public.coding_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own coding submissions" ON public.coding_submissions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers view submissions for own courses" ON public.coding_submissions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM coding_exercises ce JOIN lessons l ON l.id = ce.lesson_id JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE ce.id = coding_submissions.exercise_id AND c.teacher_id = auth.uid())
);

-- Assignments
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments viewable publicly" ON public.assignments FOR SELECT TO public USING (true);
CREATE POLICY "Teachers manage assignments" ON public.assignments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM lessons l JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE l.id = assignments.lesson_id AND c.teacher_id = auth.uid())
);

-- Assignment submissions
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  text_content text,
  file_url text,
  file_name text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  grade integer,
  feedback text,
  graded_at timestamptz
);
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own assignment submissions" ON public.assignment_submissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert assignment submissions" ON public.assignment_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own assignment submissions" ON public.assignment_submissions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers view/grade submissions for own courses" ON public.assignment_submissions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM assignments a JOIN lessons l ON l.id = a.lesson_id JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE a.id = assignment_submissions.assignment_id AND c.teacher_id = auth.uid())
);
CREATE POLICY "Teachers grade submissions" ON public.assignment_submissions FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM assignments a JOIN lessons l ON l.id = a.lesson_id JOIN sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE a.id = assignment_submissions.assignment_id AND c.teacher_id = auth.uid())
);
