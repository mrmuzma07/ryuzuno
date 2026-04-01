import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Play, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    level: string;
    total_students: number;
  };
}

const StudentCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchEnrollments = async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id, course_id, progress, enrolled_at, completed_at, course:courses(id, title, description, thumbnail_url, level, total_students)")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });
      if (data) setEnrollments(data as any);
      setLoading(false);
    };
    fetchEnrollments();
  }, [user]);

  const activeCourses = enrollments.filter((e) => !e.completed_at);
  const completedCourses = enrollments.filter((e) => e.completed_at);

  const levelLabel: Record<string, string> = {
    beginner: "Pemula",
    intermediate: "Menengah",
    advanced: "Lanjutan",
  };

  const levelColor: Record<string, string> = {
    beginner: "bg-fun-green/20 text-fun-green",
    intermediate: "bg-fun-blue/20 text-fun-blue",
    advanced: "bg-fun-pink/20 text-fun-pink",
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Kursus Saya 📚</h1>
          <p className="text-muted-foreground">Kelola dan lanjutkan kursus yang sedang kamu ikuti.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 space-y-3 animate-pulse">
                <div className="h-32 bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2">Belum ada kursus</h2>
            <p className="text-muted-foreground mb-4">Mulai belajar dengan mendaftar ke kursus pertamamu!</p>
            <Link to="/catalog">
              <Button className="rounded-xl">Jelajahi Katalog</Button>
            </Link>
          </Card>
        ) : (
          <>
            {activeCourses.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold mb-4">Sedang Dipelajari ({activeCourses.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCourses.map((enrollment) => (
                    <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-primary/40" />
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${levelColor[enrollment.course.level] || ""}`}>
                            {levelLabel[enrollment.course.level] || enrollment.course.level}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-sm line-clamp-2">{enrollment.course.title}</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{Math.round(enrollment.progress)}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                        <Link to={`/dashboard/course-player/${enrollment.course.id}`}>
                          <Button size="sm" className="w-full rounded-xl gap-2">
                            <Play className="w-3 h-3" /> Lanjutkan Belajar
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completedCourses.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold mb-4">Selesai ✅ ({completedCourses.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedCourses.map((enrollment) => (
                    <Card key={enrollment.id} className="overflow-hidden opacity-80">
                      <div className="h-24 bg-gradient-to-br from-fun-green/20 to-fun-green/5 flex items-center justify-center">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <div className="p-5 space-y-2">
                        <h3 className="font-heading font-bold text-sm line-clamp-2">{enrollment.course.title}</h3>
                        <Progress value={100} className="h-2" />
                        <p className="text-xs text-fun-green font-bold">Selesai!</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
