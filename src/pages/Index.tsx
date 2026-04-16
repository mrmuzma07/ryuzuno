import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { ArrowRight, Users, BookOpen, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("*, categories(name)")
        .eq("is_featured", true)
        .eq("status", "published")
        .limit(3);
      return (data || []).map((c: any) => ({
        ...c,
        category_name: c.categories?.name || "",
      }));
    },
  });

  const { data: learningPaths = [] } = useQuery({
    queryKey: ["learning-paths-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("learning_paths")
        .select("*, badges(name, icon), learning_path_courses(course_id)")
        .limit(3);
      return data || [];
    },
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["leaderboard-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, xp_points, avatar_url")
        .order("xp_points", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-32 px-8 lg:px-24">
        {/* Ambient blobs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#003d9b]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-0 w-64 h-64 bg-[#693600]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left — copy */}
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold uppercase tracking-widest mb-6">
              Editorial Learning Experience
            </span>
            <h1 className="text-6xl lg:text-7xl font-extrabold text-on-background leading-tight mb-8 font-headline">
              Master the <span className="text-[#003d9b]">Future</span> of Tech
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed mb-10 max-w-xl">
              A curated educational environment designed for the modern engineer. Transform technical skillsets through rigorously structured paths and high-fidelity content.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/catalog" className="signature-gradient text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:opacity-90 transition-all">
                Explore All Paths
              </Link>
              <Link to="/learning-paths">
                <Button variant="outline" className="px-8 py-4 rounded-lg font-bold text-lg border-outline-variant/30 text-on-primary-fixed-variant hover:bg-surface-container-high transition-all">
                  View Learning Paths
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-8 text-sm text-on-surface-variant">
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#003d9b]" /><strong className="text-on-surface">50K+</strong> Students</span>
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#003d9b]" /><strong className="text-on-surface">200+</strong> Courses</span>
              <span className="flex items-center gap-2"><Award className="w-4 h-4 text-tertiary" /><strong className="text-on-surface">50+</strong> Badges</span>
            </div>
          </div>

          {/* Right — visual grid */}
          <div className="relative hidden lg:grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
                <span className="material-symbols-outlined text-[#003d9b] mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h3 className="font-bold text-lg font-headline">AI &amp; ML</h3>
                <p className="text-sm text-on-surface-variant">Neural networks to deep learning architectures.</p>
              </div>
              <div className="bg-[#003d9b] text-white p-6 rounded-xl shadow-xl">
                <span className="material-symbols-outlined mb-4 block">terminal</span>
                <h3 className="font-bold text-lg font-headline">DevOps</h3>
                <p className="text-sm opacity-80">Infrastructure as code and scalable systems.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-56 rounded-xl overflow-hidden shadow-lg relative group">
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant/20" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <span className="text-white font-bold font-headline">Cloud Architectures</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
                <span className="material-symbols-outlined text-tertiary mb-4 block">smartphone</span>
                <h3 className="font-bold text-lg font-headline">Mobile</h3>
                <p className="text-sm text-on-surface-variant">Cross-platform excellence with Swift and Flutter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack Marquee ── */}
      <section className="py-16 bg-white border-y border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight font-headline">
              <span className="material-symbols-outlined text-3xl">terminal</span> Python
            </div>
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight font-headline">
              <span className="material-symbols-outlined text-3xl">javascript</span> TypeScript
            </div>
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight font-headline">
              <span className="material-symbols-outlined text-3xl">flutter_dash</span> Flutter
            </div>
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight font-headline">
              <span className="material-symbols-outlined text-3xl">database</span> SQL/NoSQL
            </div>
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight font-headline">
              <span className="material-symbols-outlined text-3xl">hub</span> Docker
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="py-20 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-extrabold text-on-background mb-12 font-headline">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/catalog?category=${cat.name}`}>
                  <div className="bg-surface-container-lowest rounded-xl p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-outline-variant/5 cursor-pointer group">
                    <div className="text-3xl mb-3">{cat.icon || "📁"}</div>
                    <h3 className="font-headline font-bold text-sm text-on-surface group-hover:text-[#003d9b] transition-colors">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Courses ── */}
      <section className="py-24 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-4xl font-extrabold text-on-background mb-4 font-headline">Featured Learning Paths</h2>
              <p className="text-on-surface-variant max-w-lg">Rigorous curricula vetted by industry experts to take you from foundation to professional mastery.</p>
            </div>
            <Link to="/catalog" className="text-[#003d9b] font-bold flex items-center gap-2 group whitespace-nowrap">
              Browse all courses
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                price={course.price}
                rating={course.rating}
                level={course.level}
                category_name={course.category_name}
                total_students={course.total_students}
                thumbnail_url={course.thumbnail_url}
              />
            ))}
            {courses.length === 0 && (
              <div className="col-span-3 text-center py-16 text-on-surface-variant">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Belum ada kursus featured.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Learning Paths ── */}
      {learningPaths.length > 0 && (
        <section className="py-24 px-8 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-on-background mb-4 font-headline">Learning Paths</h2>
              <p className="text-on-surface-variant max-w-lg mx-auto">Ikuti jalur belajar terstruktur untuk mencapai tujuanmu</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {learningPaths.map((path: any) => (
                <Link key={path.id} to={`/learning-path/${path.id}`}>
                  <div className="bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 group border border-outline-variant/5">
                    <div className="h-1 signature-gradient" />
                    <div className="p-6 space-y-4">
                      <div className="text-4xl">{path.badges?.icon || "🎯"}</div>
                      <h3 className="font-headline font-bold text-lg group-hover:text-[#003d9b] transition-colors text-on-surface">{path.title}</h3>
                      <p className="text-sm text-on-surface-variant line-clamp-2">{path.description}</p>
                      <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                        <span>{path.learning_path_courses?.length || 0} kursus</span>
                        <span>{path.estimated_hours || 0} jam</span>
                      </div>
                      {path.badges && (
                        <div className="bg-surface-container-low rounded-lg px-3 py-2 text-xs font-semibold text-on-surface-variant text-center">
                          🏅 Badge: {path.badges.name}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Leaderboard Preview ── */}
      {leaderboard.length > 0 && (
        <section className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-on-background mb-4 font-headline">Leaderboard</h2>
              <p className="text-on-surface-variant">Top learners minggu ini</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
              {leaderboard.map((user: any, i: number) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 px-6 py-4 ${i < leaderboard.length - 1 ? "border-b border-outline-variant/10" : ""} hover:bg-surface-container-low transition-colors`}
                >
                  <span className={`font-headline font-bold text-lg w-8 text-center ${i === 0 ? "text-tertiary" : "text-on-surface-variant"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <div className="w-10 h-10 rounded-full signature-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(user.full_name || "U").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-on-surface">{user.full_name || "User"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-[#003d9b]">{(user.xp_points || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-on-surface-variant">points</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/leaderboard">
                <Button variant="outline" className="rounded-lg font-semibold border-outline-variant/30 text-on-surface">
                  Lihat Leaderboard Lengkap <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Focus CTA ── */}
      <section className="py-24 px-8 bg-surface">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden signature-gradient p-12 lg:p-20 shadow-2xl">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-white mb-6 font-headline">Designed for Focus</h2>
              <p className="text-on-primary-container text-lg mb-8 leading-relaxed">
                Bergabung dengan 50,000+ learner dan mulai kumpulkan badges hari ini!
              </p>
              <Link to="/register" className="bg-white text-[#003d9b] px-8 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors inline-block">
                Daftar Sekarang — Gratis!
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner">
              <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-white/20">play_circle</span>
                <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-tertiary-fixed" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[300px] absolute -top-20 -right-20 text-white">auto_awesome</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
