import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courses, formatPrice } from "@/lib/mock-data";
import { Star, Users, Clock, BookOpen, Play, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const mockSections = [
  {
    title: "Introduction",
    lessons: [
      { title: "Welcome & Course Overview", duration: "5 min", type: "video" },
      { title: "Setup Development Environment", duration: "15 min", type: "video" },
    ],
  },
  {
    title: "Fundamentals",
    lessons: [
      { title: "Core Concepts", duration: "20 min", type: "video" },
      { title: "Hands-on Practice", duration: "30 min", type: "video" },
      { title: "Quiz: Fundamentals", duration: "10 min", type: "quiz" },
    ],
  },
  {
    title: "Advanced Topics",
    lessons: [
      { title: "Deep Dive", duration: "25 min", type: "video" },
      { title: "Real-world Project", duration: "45 min", type: "video" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ],
  },
];

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const course = courses.find((c) => c.id === id);

  // Check if user is already enrolled (for DB courses)
  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ["enrollment", id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!id,
  });

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu!");
      navigate("/login");
      return;
    }
    if (!id) return;

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: id });

      if (error) {
        if (error.code === "23505") {
          toast.info("Kamu sudah terdaftar di kursus ini!");
        } else {
          throw error;
        }
      } else {
        toast.success("Berhasil enroll! Selamat belajar 🎉");
        refetchEnrollment();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal enroll kursus");
    } finally {
      setEnrolling(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-4xl mb-4">😅</p>
          <h1 className="font-heading font-bold text-2xl">Kursus tidak ditemukan</h1>
          <Link to="/catalog"><Button className="mt-4 rounded-xl">Kembali ke Catalog</Button></Link>
        </div>
      </div>
    );
  }

  const isEnrolled = !!enrollment;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-background/60 hover:text-background mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2">
                {course.badges.map((b) => (
                  <Badge key={b} className="bg-fun-orange text-white border-0 rounded-xl">{b}</Badge>
                ))}
                <Badge variant="outline" className="text-background/80 border-background/30 rounded-xl">{course.level}</Badge>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">{course.title}</h1>
              <p className="text-background/70 text-lg">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-background/70">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-fun-yellow text-fun-yellow" /><strong className="text-background">{course.rating}</strong> ({course.reviewCount} reviews)</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.studentCount.toLocaleString()} students</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.lessonCount} lessons</span>
              </div>
              <p className="text-sm text-background/60">Dibuat oleh <strong className="text-background">{course.instructor}</strong></p>
            </div>

            {/* Pricing Card */}
            <Card className="p-6 space-y-4 self-start bg-card text-card-foreground">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-fun-blue/20 rounded-xl flex items-center justify-center">
                <Play className="w-12 h-12 text-primary" />
              </div>
              <p className="font-heading text-3xl font-bold text-primary">{formatPrice(course.price)}</p>
              {isEnrolled ? (
                <Button
                  className="w-full rounded-xl gradient-primary border-0 font-bold text-base h-12"
                  onClick={() => navigate(`/dashboard/course-player/${id}`)}
                >
                  Lanjutkan Belajar 📖
                </Button>
              ) : (
                <Button
                  className="w-full rounded-xl gradient-primary border-0 font-bold text-base h-12"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Mendaftar...</> : "Enroll Sekarang"}
                </Button>
              )}
              <Button variant="outline" className="w-full rounded-xl font-bold">
                Tambah ke Wishlist
              </Button>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✅ Akses selamanya</p>
                <p>✅ Sertifikat kelulusan</p>
                <p>✅ Badge reward</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold mb-6">Curriculum 📚</h2>
            <div className="space-y-4">
              {mockSections.map((section, si) => (
                <Card key={si} className="overflow-hidden">
                  <div className="bg-muted px-5 py-3 font-heading font-bold text-sm flex items-center justify-between">
                    <span>Section {si + 1}: {section.title}</span>
                    <span className="text-xs text-muted-foreground font-normal">{section.lessons.length} lessons</span>
                  </div>
                  {section.lessons.map((lesson, li) => (
                    <div key={li} className="px-5 py-3 flex items-center gap-3 border-t text-sm">
                      {lesson.type === "quiz" ? (
                        <CheckCircle className="w-4 h-4 text-fun-green shrink-0" />
                      ) : (
                        <Play className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="flex-1">{lesson.title}</span>
                      <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
