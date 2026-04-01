import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { badges as allBadges, courses } from "@/lib/mock-data";
import { BookOpen, Award, TrendingUp, Flame, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const StudentDashboard = () => {
  const earnedBadges = allBadges.filter((b) => b.earned);
  const enrolledCourses = courses.slice(0, 3);

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Dashboard 🎓</h1>
          <p className="text-muted-foreground">Selamat datang kembali! Lanjutkan belajarmu hari ini.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Kursus Aktif", value: "3", icon: BookOpen, color: "text-fun-blue" },
            { label: "Badges", value: earnedBadges.length.toString(), icon: Award, color: "text-fun-orange" },
            { label: "Points", value: "2,450", icon: TrendingUp, color: "text-fun-green" },
            { label: "Streak", value: "7 hari", icon: Flame, color: "text-fun-pink" },
          ].map((stat) => (
            <Card key={stat.label} className="p-5">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Active Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold">Kursus Aktif</h2>
            <Link to="/dashboard/courses"><Button variant="ghost" size="sm">Lihat Semua <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enrolledCourses.map((course, i) => (
              <Card key={course.id} className="p-5 space-y-3">
                <h3 className="font-heading font-bold text-sm line-clamp-2">{course.title}</h3>
                <p className="text-xs text-muted-foreground">{course.instructor}</p>
                <Progress value={[35, 68, 12][i]} className="h-2" />
                <p className="text-xs text-muted-foreground">{[35, 68, 12][i]}% selesai</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Badges */}
        <div>
          <h2 className="font-heading text-xl font-bold mb-4">Badges Terbaru 🏅</h2>
          <div className="flex gap-4">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className="p-4 text-center min-w-[120px]">
                <p className="text-3xl mb-1">{badge.icon}</p>
                <p className="font-heading font-bold text-xs">{badge.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
