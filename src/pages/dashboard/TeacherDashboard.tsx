import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, BookOpen, Star, TrendingUp } from "lucide-react";

const TeacherDashboard = () => (
  <DashboardLayout role="teacher">
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Teacher Dashboard 📚</h1>
        <p className="text-muted-foreground">Kelola kursus dan pantau perkembangan siswa</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Siswa", value: "1,240", icon: Users, color: "text-fun-blue" },
          { label: "Kursus Aktif", value: "5", icon: BookOpen, color: "text-fun-green" },
          { label: "Rating Rata-rata", value: "4.8", icon: Star, color: "text-fun-yellow" },
          { label: "Pendapatan", value: "Rp 12.5M", icon: TrendingUp, color: "text-fun-orange" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <p className="font-heading text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 text-center text-muted-foreground">
        <p className="text-4xl mb-3">🚧</p>
        <p className="font-heading font-bold">Fitur lengkap akan segera hadir!</p>
        <p className="text-sm mt-1">Course management, analytics, dan lainnya.</p>
      </Card>
    </div>
  </DashboardLayout>
);

export default TeacherDashboard;
