import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TipTapEditor from "@/components/TipTapEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, GripVertical, Loader2, Save, Upload } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import LessonFeaturesForm, {
  type AttachmentForm,
  type QuizForm,
  type CodingExerciseForm,
  type AssignmentForm,
} from "@/components/teacher/LessonFeaturesForm";

type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

interface LessonForm {
  id?: string;
  title: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  sort_order: number;
  attachments: AttachmentForm[];
  quiz: QuizForm | null;
  codingExercise: CodingExerciseForm | null;
  assignment: AssignmentForm | null;
}

interface SectionForm {
  id?: string;
  title: string;
  sort_order: number;
  lessons: LessonForm[];
}

const emptyLesson = (): LessonForm => ({
  title: "", content: "", video_url: "", duration_minutes: 0, sort_order: 0,
  attachments: [], quiz: null, codingExercise: null, assignment: null,
});

const TeacherCourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!courseId;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<DifficultyLevel>("beginner");
  const [price, setPrice] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [sections, setSections] = useState<SectionForm[]>([]);
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB"); return; }
    setUploadingThumbnail(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("course-thumbnails").upload(filePath, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("course-thumbnails").getPublicUrl(filePath);
      setThumbnailUrl(urlData.publicUrl);
      toast.success("Thumbnail berhasil diupload!");
    } catch (err: any) {
      toast.error(err.message || "Gagal upload thumbnail");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) setCategories(data);
    });
    if (isEdit) loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    const { data: course } = await supabase.from("courses").select("*").eq("id", courseId!).single();
    if (course) {
      setTitle(course.title);
      setDescription(course.description || "");
      setLevel(course.level);
      setPrice(String(course.price));
      setCategoryId(course.category_id || "");
      setThumbnailUrl(course.thumbnail_url || "");
      const objectives = (course as any).learning_objectives;
      setLearningObjectives(Array.isArray(objectives) ? objectives : []);
    }

    const { data: secs } = await supabase
      .from("sections")
      .select("*, lessons(*)")
      .eq("course_id", courseId!)
      .order("sort_order");

    if (secs) {
      const sectionForms: SectionForm[] = [];
      for (const s of secs) {
        const sortedLessons = ((s as any).lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
        const lessonForms: LessonForm[] = [];

        for (const l of sortedLessons) {
          // Load features for each lesson
          const [attachRes, quizRes, codingRes, assignRes] = await Promise.all([
            supabase.from("lesson_attachments").select("*").eq("lesson_id", l.id),
            supabase.from("quizzes").select("*, quiz_questions(*)").eq("lesson_id", l.id),
            supabase.from("coding_exercises").select("*").eq("lesson_id", l.id),
            supabase.from("assignments").select("*").eq("lesson_id", l.id),
          ]);

          const attachments: AttachmentForm[] = (attachRes.data || []).map((a: any) => ({
            id: a.id, file_name: a.file_name, file_url: a.file_url, file_size: a.file_size || 0,
          }));

          let quiz: QuizForm | null = null;
          if (quizRes.data && quizRes.data.length > 0) {
            const q = quizRes.data[0] as any;
            quiz = {
              title: q.title,
              passing_score: q.passing_score,
              questions: ((q.quiz_questions || []) as any[])
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((qq: any) => ({
                  question: qq.question,
                  options: Array.isArray(qq.options) ? qq.options : [],
                })),
            };
          }

          let codingExercise: CodingExerciseForm | null = null;
          if (codingRes.data && codingRes.data.length > 0) {
            const ce = codingRes.data[0];
            codingExercise = {
              title: ce.title, description: ce.description || "",
              starter_code: ce.starter_code || "", language: ce.language,
            };
          }

          let assignment: AssignmentForm | null = null;
          if (assignRes.data && assignRes.data.length > 0) {
            const a = assignRes.data[0];
            assignment = { title: a.title, description: a.description || "" };
          }

          lessonForms.push({
            id: l.id, title: l.title, content: l.content || "",
            video_url: l.video_url || "", duration_minutes: l.duration_minutes || 0,
            sort_order: l.sort_order, attachments, quiz, codingExercise, assignment,
          });
        }

        sectionForms.push({ id: s.id, title: s.title, sort_order: s.sort_order, lessons: lessonForms });
      }
      setSections(sectionForms);
    }
    setLoading(false);
  };

  const addSection = () => setSections([...sections, { title: "", sort_order: sections.length, lessons: [] }]);
  const removeSection = (idx: number) => setSections(sections.filter((_, i) => i !== idx));
  const updateSection = (idx: number, field: string, value: string) => {
    const updated = [...sections];
    (updated[idx] as any)[field] = value;
    setSections(updated);
  };

  const addLesson = (sIdx: number) => {
    const updated = [...sections];
    const lesson = emptyLesson();
    lesson.sort_order = updated[sIdx].lessons.length;
    updated[sIdx].lessons.push(lesson);
    setSections(updated);
  };

  const removeLesson = (sIdx: number, lIdx: number) => {
    const updated = [...sections];
    updated[sIdx].lessons = updated[sIdx].lessons.filter((_, i) => i !== lIdx);
    setSections(updated);
  };

  const updateLesson = (sIdx: number, lIdx: number, field: string, value: any) => {
    const updated = [...sections];
    (updated[sIdx].lessons[lIdx] as any)[field] = value;
    setSections(updated);
  };

  const handleSave = async () => {
    if (!user || !title.trim()) { toast.error("Judul kursus wajib diisi"); return; }
    setSaving(true);
    try {
      let cId = courseId;
      const courseData = {
        title: title.trim(), description: description.trim() || null, level,
        price: Number(price) || 0, category_id: categoryId || null,
        thumbnail_url: thumbnailUrl.trim() || null, teacher_id: user.id,
        learning_objectives: learningObjectives.filter(o => o.trim()) as any,
      };

      if (isEdit) {
        const { error } = await supabase.from("courses").update(courseData).eq("id", courseId!);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("courses").insert(courseData).select("id").single();
        if (error) throw error;
        cId = data.id;
      }

      // Delete existing curriculum
      if (isEdit) {
        const { data: existingSections } = await supabase.from("sections").select("id").eq("course_id", cId!);
        if (existingSections) {
          for (const s of existingSections) {
            const { data: existingLessons } = await supabase.from("lessons").select("id").eq("section_id", s.id);
            if (existingLessons) {
              for (const l of existingLessons) {
                await Promise.all([
                  supabase.from("lesson_attachments").delete().eq("lesson_id", l.id),
                  supabase.from("quiz_questions").delete().in("quiz_id",
                    (await supabase.from("quizzes").select("id").eq("lesson_id", l.id)).data?.map((q: any) => q.id) || []
                  ),
                  supabase.from("quizzes").delete().eq("lesson_id", l.id),
                  supabase.from("coding_exercises").delete().eq("lesson_id", l.id),
                  supabase.from("assignments").delete().eq("lesson_id", l.id),
                ]);
              }
            }
            await supabase.from("lessons").delete().eq("section_id", s.id);
          }
          await supabase.from("sections").delete().eq("course_id", cId!);
        }
      }

      // Save sections, lessons, and features
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (!sec.title.trim()) continue;

        const { data: secData, error: secError } = await supabase
          .from("sections")
          .insert({ course_id: cId!, title: sec.title.trim(), sort_order: i })
          .select("id").single();
        if (secError) throw secError;

        for (let j = 0; j < sec.lessons.length; j++) {
          const lesson = sec.lessons[j];
          if (!lesson.title.trim()) continue;

          const { data: lessonData, error: lesError } = await supabase
            .from("lessons")
            .insert({
              section_id: secData.id, title: lesson.title.trim(),
              content: lesson.content.trim() || null, video_url: lesson.video_url.trim() || null,
              duration_minutes: Number(lesson.duration_minutes) || 0, sort_order: j,
            })
            .select("id").single();
          if (lesError) throw lesError;

          const lessonId = lessonData.id;

          // Save attachments
          if (lesson.attachments.length > 0) {
            await supabase.from("lesson_attachments").insert(
              lesson.attachments.map((a) => ({
                lesson_id: lessonId, file_name: a.file_name, file_url: a.file_url, file_size: a.file_size,
              }))
            );
          }

          // Save quiz
          if (lesson.quiz && lesson.quiz.title.trim()) {
            const { data: quizData } = await supabase
              .from("quizzes")
              .insert({ lesson_id: lessonId, title: lesson.quiz.title.trim(), passing_score: lesson.quiz.passing_score })
              .select("id").single();

            if (quizData && lesson.quiz.questions.length > 0) {
              await supabase.from("quiz_questions").insert(
                lesson.quiz.questions.filter((q) => q.question.trim()).map((q, qIdx) => ({
                  quiz_id: quizData.id, question: q.question.trim(),
                  options: q.options as any, sort_order: qIdx,
                }))
              );
            }
          }

          // Save coding exercise
          if (lesson.codingExercise && lesson.codingExercise.title.trim()) {
            await supabase.from("coding_exercises").insert({
              lesson_id: lessonId, title: lesson.codingExercise.title.trim(),
              description: lesson.codingExercise.description.trim() || null,
              starter_code: lesson.codingExercise.starter_code || null,
              language: lesson.codingExercise.language,
            });
          }

          // Save assignment
          if (lesson.assignment && lesson.assignment.title.trim()) {
            await supabase.from("assignments").insert({
              lesson_id: lessonId, title: lesson.assignment.title.trim(),
              description: lesson.assignment.description.trim() || null,
            });
          }
        }
      }

      toast.success(isEdit ? "Kursus berhasil diperbarui!" : "Kursus berhasil dibuat!");
      navigate("/teacher/courses");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan kursus");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/teacher/courses")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">{isEdit ? "Edit Kursus" : "Buat Kursus Baru"}</h1>
            <p className="text-muted-foreground text-sm">Isi detail kursus dan buat kurikulum</p>
          </div>
        </div>

        {/* Course Details */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Detail Kursus</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Kursus *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan judul kursus" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <TipTapEditor content={description} onChange={setDescription} placeholder="Deskripsi kursus..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={level} onValueChange={(v) => setLevel(v as DifficultyLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Harga (Rp)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail / Course Cover</Label>
              <div className="flex flex-col gap-3">
                {thumbnailUrl && (
                  <div className="relative w-full max-w-sm">
                    <img src={thumbnailUrl} alt="Course thumbnail" className="w-full aspect-video object-cover rounded-xl border" />
                    <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 w-7 h-7" onClick={() => setThumbnailUrl("")}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploadingThumbnail} />
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
                      {uploadingThumbnail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload Gambar
                    </div>
                  </label>
                  <span className="text-xs text-muted-foreground">atau</span>
                  <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Paste URL gambar..." className="flex-1" />
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <Label>Yang Akan Dipelajari</Label>
              <p className="text-xs text-muted-foreground">Daftar hal yang akan dipelajari siswa di kursus ini</p>
              <div className="space-y-2">
                {learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={obj}
                      onChange={(e) => {
                        const updated = [...learningObjectives];
                        updated[i] = e.target.value;
                        setLearningObjectives(updated);
                      }}
                      placeholder={`Poin ${i + 1}`}
                      className="flex-1"
                    />
                    <Button type="button" size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => setLearningObjectives(learningObjectives.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={() => setLearningObjectives([...learningObjectives, ""])} className="gap-1 text-xs">
                  <Plus className="w-3 h-3" /> Tambah Poin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Curriculum Builder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Kurikulum</CardTitle>
            <Button size="sm" variant="outline" onClick={addSection} className="gap-1">
              <Plus className="w-4 h-4" /> Tambah Section
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">Belum ada section. Klik "Tambah Section" untuk memulai.</p>
            )}
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="border rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-bold text-muted-foreground">Section {sIdx + 1}</span>
                  <Input value={section.title} onChange={(e) => updateSection(sIdx, "title", e.target.value)} placeholder="Nama section" className="flex-1" />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeSection(sIdx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="pl-7 space-y-3">
                  {section.lessons.map((lesson, lIdx) => (
                    <div key={lIdx} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Lesson {lIdx + 1}</span>
                        <Input value={lesson.title} onChange={(e) => updateLesson(sIdx, lIdx, "title", e.target.value)} placeholder="Judul lesson" className="flex-1" />
                        <Input type="number" value={lesson.duration_minutes} onChange={(e) => updateLesson(sIdx, lIdx, "duration_minutes", Number(e.target.value))} placeholder="Menit" className="w-20" />
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeLesson(sIdx, lIdx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input value={lesson.video_url} onChange={(e) => updateLesson(sIdx, lIdx, "video_url", e.target.value)} placeholder="Video URL (opsional)" />
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-medium">Konten Lesson</span>
                        <TipTapEditor content={lesson.content} onChange={(val) => updateLesson(sIdx, lIdx, "content", val)} placeholder="Tulis konten lesson..." />
                      </div>

                      {/* Lesson Features */}
                      <LessonFeaturesForm
                        attachments={lesson.attachments}
                        quiz={lesson.quiz}
                        codingExercise={lesson.codingExercise}
                        assignment={lesson.assignment}
                        onAttachmentsChange={(val) => updateLesson(sIdx, lIdx, "attachments", val)}
                        onQuizChange={(val) => updateLesson(sIdx, lIdx, "quiz", val)}
                        onCodingExerciseChange={(val) => updateLesson(sIdx, lIdx, "codingExercise", val)}
                        onAssignmentChange={(val) => updateLesson(sIdx, lIdx, "assignment", val)}
                      />
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => addLesson(sIdx)} className="gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Tambah Lesson
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/teacher/courses")}>Batal</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Simpan Perubahan" : "Buat Kursus"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherCourseForm;
