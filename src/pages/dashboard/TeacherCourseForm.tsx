import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, GripVertical, Loader2, Save, Upload, ImageIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

interface LessonForm {
  id?: string;
  title: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  sort_order: number;
}

interface SectionForm {
  id?: string;
  title: string;
  sort_order: number;
  lessons: LessonForm[];
}

const TeacherCourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!courseId;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);

  // Course fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<DifficultyLevel>("beginner");
  const [price, setPrice] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Curriculum
  const [sections, setSections] = useState<SectionForm[]>([]);

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

    if (isEdit) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId!)
      .single();

    if (course) {
      setTitle(course.title);
      setDescription(course.description || "");
      setLevel(course.level);
      setPrice(String(course.price));
      setCategoryId(course.category_id || "");
      setThumbnailUrl(course.thumbnail_url || "");
    }

    const { data: secs } = await supabase
      .from("sections")
      .select("*, lessons(*)")
      .eq("course_id", courseId!)
      .order("sort_order");

    if (secs) {
      setSections(secs.map((s: any) => ({
        id: s.id,
        title: s.title,
        sort_order: s.sort_order,
        lessons: (s.lessons || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            content: l.content || "",
            video_url: l.video_url || "",
            duration_minutes: l.duration_minutes || 0,
            sort_order: l.sort_order,
          })),
      })));
    }
    setLoading(false);
  };

  const addSection = () => {
    setSections([...sections, { title: "", sort_order: sections.length, lessons: [] }]);
  };

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const updateSection = (idx: number, field: string, value: string) => {
    const updated = [...sections];
    (updated[idx] as any)[field] = value;
    setSections(updated);
  };

  const addLesson = (sectionIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx].lessons.push({
      title: "",
      content: "",
      video_url: "",
      duration_minutes: 0,
      sort_order: updated[sectionIdx].lessons.length,
    });
    setSections(updated);
  };

  const removeLesson = (sectionIdx: number, lessonIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx].lessons = updated[sectionIdx].lessons.filter((_, i) => i !== lessonIdx);
    setSections(updated);
  };

  const updateLesson = (sectionIdx: number, lessonIdx: number, field: string, value: any) => {
    const updated = [...sections];
    (updated[sectionIdx].lessons[lessonIdx] as any)[field] = value;
    setSections(updated);
  };

  const handleSave = async () => {
    if (!user || !title.trim()) {
      toast.error("Judul kursus wajib diisi");
      return;
    }

    setSaving(true);
    try {
      let cId = courseId;

      const courseData = {
        title: title.trim(),
        description: description.trim() || null,
        level,
        price: Number(price) || 0,
        category_id: categoryId || null,
        thumbnail_url: thumbnailUrl.trim() || null,
        teacher_id: user.id,
      };

      if (isEdit) {
        const { error } = await supabase.from("courses").update(courseData).eq("id", courseId!);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("courses").insert(courseData).select("id").single();
        if (error) throw error;
        cId = data.id;
      }

      // Save curriculum - delete existing and recreate
      if (isEdit) {
        const { data: existingSections } = await supabase.from("sections").select("id").eq("course_id", cId!);
        if (existingSections) {
          for (const s of existingSections) {
            await supabase.from("lessons").delete().eq("section_id", s.id);
          }
          await supabase.from("sections").delete().eq("course_id", cId!);
        }
      }

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (!sec.title.trim()) continue;

        const { data: secData, error: secError } = await supabase
          .from("sections")
          .insert({ course_id: cId!, title: sec.title.trim(), sort_order: i })
          .select("id")
          .single();

        if (secError) throw secError;

        const lessonsToInsert = sec.lessons
          .filter((l) => l.title.trim())
          .map((l, j) => ({
            section_id: secData.id,
            title: l.title.trim(),
            content: l.content.trim() || null,
            video_url: l.video_url.trim() || null,
            duration_minutes: Number(l.duration_minutes) || 0,
            sort_order: j,
          }));

        if (lessonsToInsert.length > 0) {
          const { error: lesError } = await supabase.from("lessons").insert(lessonsToInsert);
          if (lesError) throw lesError;
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
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi kursus..." rows={4} />
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
              <Label>Thumbnail URL</Label>
              <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
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
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(sIdx, "title", e.target.value)}
                    placeholder="Nama section"
                    className="flex-1"
                  />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeSection(sIdx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="pl-7 space-y-3">
                  {section.lessons.map((lesson, lIdx) => (
                    <div key={lIdx} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Lesson {lIdx + 1}</span>
                        <Input
                          value={lesson.title}
                          onChange={(e) => updateLesson(sIdx, lIdx, "title", e.target.value)}
                          placeholder="Judul lesson"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={lesson.duration_minutes}
                          onChange={(e) => updateLesson(sIdx, lIdx, "duration_minutes", Number(e.target.value))}
                          placeholder="Menit"
                          className="w-20"
                        />
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeLesson(sIdx, lIdx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={lesson.video_url}
                        onChange={(e) => updateLesson(sIdx, lIdx, "video_url", e.target.value)}
                        placeholder="Video URL (opsional)"
                      />
                      <Textarea
                        value={lesson.content}
                        onChange={(e) => updateLesson(sIdx, lIdx, "content", e.target.value)}
                        placeholder="Konten lesson (opsional)"
                        rows={2}
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
