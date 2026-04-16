import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, CheckCircle, Circle, PlayCircle, FileText, ChevronDown } from "lucide-react";
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
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();
    setCourse(courseData);

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
      setExpandedSections(new Set(sectionsData.map((s) => s.id)));

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

    toast.success("Lesson selesai!");

    const allLessons = sections.flatMap((s) => s.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson({ ...allLessons[currentIndex + 1], completed: completedLessons.has(allLessons[currentIndex + 1].id) });
    }

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
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-surface-container-high rounded-lg w-1/3" />
          <div className="h-2 bg-surface-container-high rounded-full w-full" />
          <div className="h-[400px] bg-surface-container-high rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">menu_book</span>
          <h1 className="font-headline text-2xl font-bold text-[#003d9b] mb-2">Kursus tidak ditemukan</h1>
          <Link to="/dashboard/courses">
            <Button className="rounded-lg mt-4 bg-[#003d9b] hover:bg-primary-container text-white">Kembali</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="hero-gradient text-white rounded-2xl px-8 py-8 relative overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-4 right-8 w-48 h-48 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-[-30px] left-[-10px] w-64 h-64 bg-[#693600] rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-4 text-sm text-blue-200">
              <Link to="/dashboard/courses" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Kursus Saya
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-white">{course.title}</span>
            </nav>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold font-headline leading-tight mb-3">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">menu_book</span>
                <span>{completedLessons.size}/{totalLessons} lessons</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">trending_up</span>
                <span>{overallProgress}% selesai</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffb77d] rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Player & Lesson Content */}
          <div className="lg:col-span-8 space-y-6">
            {activeLesson ? (
              <>
                {/* Video / Text Content Area */}
                {activeLesson.video_url ? (
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
                    <iframe
                      src={toEmbedUrl(activeLesson.video_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-surface-container-lowest rounded-2xl border border-outline-variant/15 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">description</span>
                      <p className="text-on-surface-variant font-medium">Materi Teks</p>
                    </div>
                  </div>
                )}

                {/* Lesson Detail Card */}
                <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/15 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl md:text-2xl font-bold font-headline text-[#003d9b]">
                      {activeLesson.title}
                    </h2>
                    {activeLesson.duration_minutes && (
                      <span className="text-sm text-on-surface-variant font-medium shrink-0 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {activeLesson.duration_minutes} menit
                      </span>
                    )}
                  </div>

                  {activeLesson.content && (
                    <div
                      className="prose prose-slate max-w-none text-on-surface-variant leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                    />
                  )}

                  {/* Lesson Features */}
                  <div className="space-y-6 pt-2">
                    <LessonAttachments lessonId={activeLesson.id} />
                    <LessonQuiz lessonId={activeLesson.id} />
                    <LessonCodingExercise lessonId={activeLesson.id} />
                    <LessonAssignment lessonId={activeLesson.id} />
                  </div>

                  {/* Complete / Completed Button */}
                  {!completedLessons.has(activeLesson.id) ? (
                    <Button
                      onClick={completeLesson}
                      className="rounded-lg gap-2 bg-[#003d9b] hover:bg-primary-container text-white font-bold px-6 py-3 shadow-lg shadow-[#003d9b]/20"
                    >
                      <CheckCircle className="w-4 h-4" /> Tandai Selesai
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-3 rounded-lg">
                      <CheckCircle className="w-5 h-5" /> Lesson ini sudah selesai
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-surface-container-lowest p-16 text-center rounded-2xl border border-outline-variant/15">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">school</span>
                <h2 className="font-headline text-xl font-bold text-[#003d9b]">Belum ada materi</h2>
                <p className="text-on-surface-variant mt-2">Kursus ini belum memiliki lesson.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Curriculum */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-4">
              {/* Sidebar Header */}
              <div className="bg-surface-container-low flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/10">
                <div className="w-10 h-10 bg-[#003d9b]/10 rounded-full flex items-center justify-center text-[#003d9b]">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
                <div>
                  <h5 className="font-headline font-bold text-[#003d9b] text-sm">Kurikulum</h5>
                  <p className="text-xs text-on-surface-variant">
                    {sections.length} Modul &bull; {totalLessons} Lessons
                  </p>
                </div>
              </div>

              {/* Sections Accordion */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden divide-y divide-outline-variant/10">
                {sections.length === 0 ? (
                  <div className="p-6 text-center text-sm text-on-surface-variant">
                    Belum ada section.
                  </div>
                ) : (
                  sections.map((section) => {
                    const sectionCompleted = section.lessons.filter((l) => completedLessons.has(l.id)).length;
                    const isExpanded = expandedSections.has(section.id);

                    return (
                      <div key={section.id}>
                        {/* Section Header */}
                        <button
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-container-low transition-colors"
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-headline font-bold text-sm text-[#003d9b] line-clamp-1">
                              {section.title}
                            </span>
                            <span className="text-xs text-on-surface-variant">
                              {sectionCompleted}/{section.lessons.length} selesai
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-on-surface-variant shrink-0 ml-2 transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Lessons List */}
                        {isExpanded && (
                          <div className="border-t border-outline-variant/10">
                            {section.lessons.map((lesson) => {
                              const isActive = activeLesson?.id === lesson.id;
                              const isCompleted = completedLessons.has(lesson.id);

                              return (
                                <button
                                  key={lesson.id}
                                  className={`w-full py-3 px-4 flex items-center gap-3 text-left text-sm transition-colors ${
                                    isActive
                                      ? "bg-[#003d9b]/5 text-[#003d9b] border-l-2 border-[#003d9b]"
                                      : "hover:bg-surface-container-low text-on-surface-variant"
                                  }`}
                                  onClick={() => setActiveLesson(lesson)}
                                >
                                  {/* Status Icon */}
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                  ) : isActive ? (
                                    <PlayCircle className="w-4 h-4 text-[#003d9b] shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-outline-variant shrink-0" />
                                  )}

                                  <span className={`flex-1 line-clamp-1 ${isActive ? "font-semibold" : ""}`}>
                                    {lesson.title}
                                  </span>

                                  {lesson.duration_minutes && (
                                    <span className="text-xs text-on-surface-variant shrink-0">
                                      {lesson.duration_minutes}m
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Progress Summary Card */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 space-y-4">
                <h4 className="font-headline font-bold text-sm text-[#003d9b]">Progress Kursus</h4>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#e7e7f2" strokeWidth="6" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#003d9b"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${overallProgress * 1.76} 176`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#003d9b]">{overallProgress}%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>Selesai</span>
                      <span className="font-bold text-on-surface">{completedLessons.size}</span>
                    </div>
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>Tersisa</span>
                      <span className="font-bold text-on-surface">{totalLessons - completedLessons.size}</span>
                    </div>
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>Total</span>
                      <span className="font-bold text-on-surface">{totalLessons}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoursePlayer;
