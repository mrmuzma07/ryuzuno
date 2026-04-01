import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, BookOpen, Award, TrendingUp, Tag, Route } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, courses, badges, categories, paths, enrollments] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("badges").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("learning_paths").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
      ]);
      return {
        users: users.count || 0,
        courses: courses.count || 0,
        badges: badges.count || 0,
        categories: categories.count || 0,
        paths: paths.count || 0,
        enrollments: enrollments.count || 0,
      };
    },
  });

  const cards = [
    { label: "Total Users", value: stats?.users ?? "—", icon: Users, color: "text-fun-blue", to: "/admin/users" },
    { label: "Total Kursus", value: stats?.courses ?? "—", icon: BookOpen, color: "text-fun-green", to: "/admin/courses" },
    { label: "Total Badges", value: stats?.badges ?? "—", icon: Award, color: "text-fun-orange", to: "/admin/badges" },
    { label: "Kategori", value: stats?.categories ?? "—", icon: Tag, color: "text-fun-pink", to: "/admin/categories" },
    { label: "Learning Paths", value: stats?.paths ?? "—", icon: Route, color: "text-fun-blue", to: "/admin/paths" },
    { label: "Enrollments", value: stats?.enrollments ?? "—", icon: TrendingUp, color: "text-fun-green", to: "#" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Admin Dashboard ⚙️</h1>
          <p className="text-muted-foreground">Overview platform RyuZuno</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((stat) => (
            <Link key={stat.label} to={stat.to}>
              <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                <p className="font-heading text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
