import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, BookOpen, Star, TrendingUp, PlusCircle, Loader2 } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, courses: 0, avgRating: 0, revenue: 0 });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [coursesRes, enrollmentsRes, reviewsRes] = await Promise.all([
        supabase.from("courses").select("id, title, status, total_students, price, rating, created_at").eq("teacher_id", user.id).order("created_at", { ascending: false }),
        supabase.from("enrollments").select("id, courses!inner(teacher_id)").eq("courses.teacher_id", user.id),
        supabase.from("reviews").select("rating, courses!inner(teacher_id)").eq("courses.teacher_id", user.id),
      ]);

      const courses = coursesRes.data || [];
      const totalStudents = enrollmentsRes.data?.length || 0;
      const ratings = reviewsRes.data || [];
      const avgRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
      const revenue = courses.reduce((s, c) => s + Number(c.price) * c.total_students, 0);

      setStats({ students: totalStudents, courses: courses.length, avgRating: Number(avgRating.toFixed(1)), revenue });
      setRecentCourses(courses.slice(0, 5));
      setLoading(false);
    };
    load();
  }, [user]);

  const statCards = [
    { label: "Total Siswa", value: stats.students.toLocaleString("id-ID"), icon: Users, color: "text-fun-blue" },
    { label: "Kursus", value: String(stats.courses), icon: BookOpen, color: "text-fun-green" },
    { label: "Rating", value: String(stats.avgRating), icon: Star, color: "text-fun-yellow" },
    { label: "Pendapatan", value: `Rp ${(stats.revenue / 1_000_000).toFixed(1)}M`, icon: TrendingUp, color: "text-fun-orange" },
  ];

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Teacher Dashboard 📚</h1>
            <p className="text-muted-foreground">Kelola kursus dan pantau perkembangan siswa</p>
          </div>
          <Link to="/teacher/create">
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Buat Kursus</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat) => (
                <Card key={stat.label} className="p-5">
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                  <p className="font-heading text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-lg">Kursus Terbaru</h2>
                <Link to="/teacher/courses"><Button variant="ghost" size="sm">Lihat Semua</Button></Link>
              </div>
              {recentCourses.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">Belum ada kursus. Buat kursus pertamamu!</p>
              ) : (
                <div className="space-y-3">
                  {recentCourses.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.total_students} siswa • Rating {c.rating || 0}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
