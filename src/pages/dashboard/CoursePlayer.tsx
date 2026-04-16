import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Circle, PlayCircle, ChevronDown, BookOpen, Menu, X } from "lucide-react";
import { toast } from "sonner";
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

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/dashboard/courses", label: "Kursus Saya", icon: "school" },
  { to: "/dashboard/paths", label: "Learning Paths", icon: "route" },
  { to: "/dashboard/badges", label: "Badges", icon: "military_tech" },
  { to: "/dashboard/leaderboard", label: "Leaderboard", icon: "leaderboard" },
  { to: "/dashboard/profile", label: "Profile", icon: "person" },
];

const CoursePlayer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "resources">("overview");

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

    const totalLessonsCount = allLessons.length;
    const newCompleted = completedLessons.size + 1;
    const newProgress = Math.round((newCompleted / totalLessonsCount) * 100);

    await supabase
      .from("enrollments")
      .update({ progress: newProgress, ...(newProgress >= 100 ? { completed_at: new Date().toISOString() } : {}) })
      .eq("user_id", user.id)
      .eq("course_id", courseId!);
  };

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;

  // Find active section for the module badge
  const activeSection = sections.find((s) => s.lessons.some((l) => l.id === activeLesson?.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        {/* Header skeleton */}
        <div className="fixed top-0 w-full z-50 h-16 bg-slate-50/80 backdrop-blur-xl shadow-sm" />
        <div className="flex min-h-screen pt-16">
          <aside className="hidden lg:block w-72 bg-surface-container-low/50" />
          <main className="flex-1 p-8">
            <div className="max-w-5xl mx-auto animate-pulse space-y-6">
              <div className="aspect-video bg-surface-container-high rounded-2xl" />
              <div className="h-8 bg-surface-container-high rounded-lg w-1/3" />
              <div className="h-40 bg-surface-container-high rounded-2xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">menu_book</span>
          <h1 className="font-headline text-2xl font-bold text-[#003d9b] mb-2">Kursus tidak ditemukan</h1>
          <Link
            to="/dashboard/courses"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#003d9b] text-white font-bold rounded-lg hover:bg-primary-container transition-all"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ===== Top Header Navigation ===== */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,61,155,0.04)]">
        <nav className="flex justify-between items-center h-16 px-6 lg:px-8 w-full">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <BookOpen className="w-5 h-5 text-[#003d9b]" />
              <span className="text-xl font-extrabold tracking-tighter text-[#003d9b] font-headline">RyuZuno</span>
            </Link>
            <div className="hidden md:flex gap-1 items-center font-headline text-sm tracking-wide">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "text-[#003d9b] font-bold bg-[#003d9b]/5"
                        : "text-slate-500 hover:text-[#003d9b] hover:bg-slate-100/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Icons + Avatar */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </button>
            <button
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button className="hidden md:flex p-2 text-slate-500 hover:bg-[#003d9b]/5 rounded-lg transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hidden md:flex p-2 text-slate-500 hover:bg-[#003d9b]/5 rounded-lg transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#003d9b]/10">
              U
            </div>
          </div>
        </nav>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#003d9b] bg-[#003d9b]/5 font-bold"
                        : "text-slate-500 hover:text-[#003d9b] hover:bg-slate-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ===== Main Layout: Sidebar + Content ===== */}
      <div className="flex min-h-screen pt-16">
        {/* Left Sidebar: Curriculum Navigator */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-surface-container-low/50 overflow-y-auto no-scrollbar z-40 transform transition-transform lg:translate-x-0 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Course Info Header */}
          <div className="px-6 py-5 mb-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[#003d9b]">school</span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Progress</h3>
                <p className="font-headline font-bold text-[#003d9b] text-sm leading-tight line-clamp-2">{course.title}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-[#003d9b] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
              {overallProgress}% Complete
            </p>
          </div>

          {/* Curriculum Sections */}
          <nav className="px-4 pb-10">
            <div className="px-2 py-2 border-t border-slate-200/50">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 mt-3">Curriculum</h4>
              <div className="space-y-4">
                {sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);

                  return (
                    <div key={section.id} className="space-y-1">
                      {/* Section title */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between text-left group"
                      >
                        <p className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#003d9b] transition-colors">
                          {section.title}
                        </p>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Lessons list */}
                      {isExpanded && (
                        <div className="pl-2 border-l-2 border-[#003d9b]/20 space-y-0.5 mt-2">
                          {section.lessons.map((lesson) => {
                            const isActive = activeLesson?.id === lesson.id;
                            const isCompleted = completedLessons.has(lesson.id);

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => {
                                  setActiveLesson(lesson);
                                  setMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                                  isActive
                                    ? "bg-[#003d9b]/5 text-[#003d9b]"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                              >
                                {isCompleted ? (
                                  <span className="material-symbols-outlined text-sm text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                ) : isActive ? (
                                  <span className="material-symbols-outlined text-sm text-[#003d9b]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                ) : (
                                  <span className="material-symbols-outlined text-sm text-slate-400">radio_button_unchecked</span>
                                )}
                                <span className={`text-xs line-clamp-1 flex-1 ${isActive ? "font-semibold" : ""}`}>
                                  {lesson.title}
                                </span>
                                {lesson.duration_minutes && (
                                  <span className="text-[10px] text-slate-400 shrink-0">{lesson.duration_minutes}m</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ===== Main Content Area ===== */}
        <main className="flex-1 overflow-y-auto bg-surface p-4 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {activeLesson ? (
              <>
                {/* Video Player Section */}
                {activeLesson.video_url ? (
                  <section className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
                    <iframe
                      src={toEmbedUrl(activeLesson.video_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </section>
                ) : (
                  <section className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-slate-400 mb-3 block">description</span>
                      <p className="text-slate-400 font-medium">Materi Teks</p>
                    </div>
                  </section>
                )}

                {/* Lesson Info Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {activeSection && (
                        <span className="px-3 py-1 bg-[#003d9b]/10 text-[#003d9b] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                          {activeSection.title}
                        </span>
                      )}
                      {activeLesson.duration_minutes && (
                        <span className="text-on-surface-variant text-sm">
                          &bull; {activeLesson.duration_minutes} menit
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface leading-tight font-headline">
                      {activeLesson.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {!completedLessons.has(activeLesson.id) ? (
                      <button
                        onClick={completeLesson}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#003d9b] to-primary-container text-white rounded-lg font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Tandai Selesai
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg font-bold text-sm border border-green-200">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Sudah Selesai
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs Content Section */}
                <section className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
                  {/* Tab Buttons */}
                  <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 m-4 mb-0">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "overview"
                          ? "bg-white text-[#003d9b] font-bold shadow-sm"
                          : "text-slate-500 hover:text-[#003d9b]"
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab("resources")}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "resources"
                          ? "bg-white text-[#003d9b] font-bold shadow-sm"
                          : "text-slate-500 hover:text-[#003d9b]"
                      }`}
                    >
                      Resources
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="px-6 lg:px-8 pb-8 pt-6 space-y-6">
                    {activeTab === "overview" && (
                      <>
                        {activeLesson.content && (
                          <div className="prose prose-slate max-w-none">
                            <h2 className="text-xl font-bold text-on-surface mb-4 font-headline">Materi Pembelajaran</h2>
                            <div
                              className="text-on-surface-variant leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                            />
                          </div>
                        )}

                        {!activeLesson.content && (
                          <div className="text-center py-8">
                            <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">article</span>
                            <p className="text-on-surface-variant text-sm">Belum ada konten untuk lesson ini.</p>
                          </div>
                        )}

                        {/* Lesson interactive features */}
                        <LessonQuiz lessonId={activeLesson.id} />
                        <LessonCodingExercise lessonId={activeLesson.id} />
                        <LessonAssignment lessonId={activeLesson.id} />
                      </>
                    )}

                    {activeTab === "resources" && (
                      <div className="space-y-6">
                        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline">
                          Lesson Resources
                        </h3>
                        <LessonAttachments lessonId={activeLesson.id} />
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <div className="bg-surface-container-lowest p-16 text-center rounded-2xl border border-outline-variant/15">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">school</span>
                <h2 className="font-headline text-xl font-bold text-[#003d9b]">Belum ada materi</h2>
                <p className="text-on-surface-variant mt-2">Kursus ini belum memiliki lesson.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursePlayer;
