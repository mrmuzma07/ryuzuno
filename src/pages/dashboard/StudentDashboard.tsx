import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, TrendingUp, Flame, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();

  const { data: enrollments = [] } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("enrollments")
        .select("*, courses(title)")
        .eq("user_id", user.id)
        .limit(3);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ["my-badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_badges")
        .select("*, badges(name, icon)")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("xp_points").eq("id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Dashboard 🎓</h1>
          <p className="text-muted-foreground">Selamat datang kembali! Lanjutkan belajarmu hari ini.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Kursus Aktif", value: enrollments.length.toString(), icon: BookOpen, color: "text-fun-blue" },
            { label: "Badges", value: earnedBadges.length.toString(), icon: Award, color: "text-fun-orange" },
            { label: "Points", value: (profile?.xp_points || 0).toLocaleString(), icon: TrendingUp, color: "text-fun-green" },
            { label: "Streak", value: "—", icon: Flame, color: "text-fun-pink" },
          ].map((stat) => (
            <Card key={stat.label} className="p-5">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold">Kursus Aktif</h2>
            <Link to="/dashboard/courses"><Button variant="ghost" size="sm">Lihat Semua <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enrollments.map((enr: any) => (
              <Card key={enr.id} className="p-5 space-y-3">
                <h3 className="font-heading font-bold text-sm line-clamp-2">{enr.courses?.title}</h3>
                <Progress value={Number(enr.progress) || 0} className="h-2" />
                <p className="text-xs text-muted-foreground">{Math.round(Number(enr.progress) || 0)}% selesai</p>
              </Card>
            ))}
            {enrollments.length === 0 && <p className="text-muted-foreground col-span-3">Belum ada kursus yang diikuti</p>}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold mb-4">Badges Terbaru 🏅</h2>
          <div className="flex gap-4">
            {earnedBadges.map((ub: any) => (
              <Card key={ub.id} className="p-4 text-center min-w-[120px]">
                <p className="text-3xl mb-1">{ub.badges?.icon}</p>
                <p className="font-heading font-bold text-xs">{ub.badges?.name}</p>
              </Card>
            ))}
            {earnedBadges.length === 0 && <p className="text-muted-foreground">Belum ada badges</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
