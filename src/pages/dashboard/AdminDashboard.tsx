import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, BookOpen, Award, TrendingUp } from "lucide-react";

const AdminDashboard = () => (
  <DashboardLayout role="admin">
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Admin Dashboard ⚙️</h1>
        <p className="text-muted-foreground">Overview platform EduQuest</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "50,240", icon: Users, color: "text-fun-blue" },
          { label: "Total Kursus", value: "214", icon: BookOpen, color: "text-fun-green" },
          { label: "Total Badges", value: "48", icon: Award, color: "text-fun-orange" },
          { label: "Revenue", value: "Rp 2.1B", icon: TrendingUp, color: "text-fun-pink" },
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
        <p className="font-heading font-bold">Panel admin lengkap akan segera hadir!</p>
        <p className="text-sm mt-1">User management, course moderation, reports, dan lainnya.</p>
      </Card>
    </div>
  </DashboardLayout>
);

export default AdminDashboard;
