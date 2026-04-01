import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, CheckCircle, Circle, PlayCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import LessonAttachments from "@/components/lesson/LessonAttachments";
import LessonQuiz from "@/components/lesson/LessonQuiz";
import LessonCodingExercise from "@/components/lesson/LessonCodingExercise";
import LessonAssignment from "@/components/lesson/LessonAssignment";

interface Section {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
  completed: boolean;
}

const toEmbedUrl = (url: string) => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
};

const CoursePlayer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !user) return;
    fetchCourseData();
  }, [courseId, user]);

  const fetchCourseData = async () => {
    // Fetch course
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();
    setCourse(courseData);

    // Fetch sections with lessons
    const { data: sectionsData } = await supabase
      .from("sections")
      .select("id, title, sort_order")
      .eq("course_id", courseId!)
      .order("sort_order");

    if (sectionsData) {
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id, title, content, video_url, duration_minutes, sort_order, section_id")
        .in("section_id", sectionsData.map((s) => s.id))
        .order("sort_order");

      // Fetch user progress
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user!.id);

      const completedSet = new Set(
        (progressData || []).filter((p) => p.completed).map((p) => p.lesson_id)
      );
      setCompletedLessons(completedSet);

      const builtSections: Section[] = sectionsData.map((s) => ({
        ...s,
        lessons: (lessonsData || [])
          .filter((l) => l.section_id === s.id)
          .map((l) => ({ ...l, completed: completedSet.has(l.id) })),
      }));

      setSections(builtSections);

      // Expand all sections initially
      setExpandedSections(new Set(sectionsData.map((s) => s.id)));

      // Auto-select first incomplete lesson or first lesson
      const allLessons = builtSections.flatMap((s) => s.lessons);
      const firstIncomplete = allLessons.find((l) => !completedSet.has(l.id));
      setActiveLesson(firstIncomplete || allLessons[0] || null);
    }

    setLoading(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  };

  const completeLesson = async () => {
    if (!activeLesson || !user) return;

    const { error } = await supabase.from("lesson_progress").upsert(
      { user_id: user.id, lesson_id: activeLesson.id, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );

    if (error) {
      // If upsert fails due to no unique constraint, try insert
      await supabase.from("lesson_progress").insert({
        user_id: user.id,
        lesson_id: activeLesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }

    setCompletedLessons((prev) => new Set([...prev, activeLesson.id]));
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        lessons: s.lessons.map((l) => (l.id === activeLesson.id ? { ...l, completed: true } : l)),
      }))
    );

    toast.success("Lesson selesai! 🎉");

    // Auto-advance to next lesson
    const allLessons = sections.flatMap((s) => s.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson({ ...allLessons[currentIndex + 1], completed: completedLessons.has(allLessons[currentIndex + 1].id) });
    }

    // Update enrollment progress
    const totalLessons = allLessons.length;
    const newCompleted = completedLessons.size + 1;
    const newProgress = Math.round((newCompleted / totalLessons) * 100);

    await supabase
      .from("enrollments")
      .update({ progress: newProgress, ...(newProgress >= 100 ? { completed_at: new Date().toISOString() } : {}) })
      .eq("user_id", user.id)
      .eq("course_id", courseId!);
  };

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📚</p>
          <h1 className="font-heading text-2xl font-bold mb-2">Kursus tidak ditemukan</h1>
          <Link to="/dashboard/courses"><Button className="rounded-xl mt-4">Kembali</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard/courses">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-xl md:text-2xl font-bold line-clamp-1">{course.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>{completedLessons.size}/{totalLessons} lessons</span>
              <span>•</span>
              <span>{overallProgress}% selesai</span>
            </div>
          </div>
        </div>

        <Progress value={overallProgress} className="h-2" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {activeLesson ? (
              <>
                {/* Video Player */}
                {activeLesson.video_url ? (
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                    <iframe
                      src={toEmbedUrl(activeLesson.video_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <Card className="aspect-video rounded-2xl flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Materi Teks</p>
                    </div>
                  </Card>
                )}

                {/* Lesson info */}
                <Card className="p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-bold">{activeLesson.title}</h2>
                    {activeLesson.duration_minutes && (
                      <span className="text-xs text-muted-foreground">{activeLesson.duration_minutes} menit</span>
                    )}
                  </div>

                  {activeLesson.content && (
                    <div className="prose prose-sm max-w-none text-foreground/80">
                      <p>{activeLesson.content}</p>
                    </div>
                  )}

                  {!completedLessons.has(activeLesson.id) ? (
                    <Button onClick={completeLesson} className="rounded-xl gap-2 w-full md:w-auto">
                      <CheckCircle className="w-4 h-4" /> Tandai Selesai
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-fun-green font-bold text-sm">
                      <CheckCircle className="w-4 h-4" /> Lesson ini sudah selesai
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center rounded-2xl">
                <p className="text-4xl mb-2">🎉</p>
                <h2 className="font-heading text-xl font-bold">Belum ada materi</h2>
                <p className="text-muted-foreground">Kursus ini belum memiliki lesson.</p>
              </Card>
            )}
          </div>

          {/* Sidebar - Curriculum */}
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-sm mb-3">Kurikulum</h3>
            {sections.length === 0 ? (
              <Card className="p-4 text-center text-sm text-muted-foreground">Belum ada section.</Card>
            ) : (
              sections.map((section) => (
                <Card key={section.id} className="overflow-hidden rounded-xl">
                  <button
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="font-heading font-bold text-xs">{section.title}</span>
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections.has(section.id) && (
                    <div className="border-t">
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          className={`w-full p-3 flex items-center gap-2 text-left text-xs hover:bg-muted/30 transition-colors ${
                            activeLesson?.id === lesson.id ? "bg-primary/10 text-primary" : ""
                          }`}
                          onClick={() => setActiveLesson(lesson)}
                        >
                          {completedLessons.has(lesson.id) ? (
                            <CheckCircle className="w-4 h-4 text-fun-green shrink-0" />
                          ) : activeLesson?.id === lesson.id ? (
                            <PlayCircle className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="line-clamp-1 flex-1">{lesson.title}</span>
                          {lesson.duration_minutes && (
                            <span className="text-muted-foreground shrink-0">{lesson.duration_minutes}m</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoursePlayer;
