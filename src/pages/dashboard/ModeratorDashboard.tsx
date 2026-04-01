import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { FileCheck, Shield, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ModeratorDashboard = () => {
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["mod-stat-pending"],
    queryFn: async () => {
      const { count } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_review");
      return count || 0;
    },
  });

  const { data: approvedCount = 0 } = useQuery({
    queryKey: ["mod-stat-approved"],
    queryFn: async () => {
      const { count } = await supabase
        .from("course_reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");
      return count || 0;
    },
  });

  const { data: rejectedCount = 0 } = useQuery({
    queryKey: ["mod-stat-rejected"],
    queryFn: async () => {
      const { count } = await supabase
        .from("course_reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "rejected");
      return count || 0;
    },
  });

  const stats = [
    { label: "Menunggu Review", value: pendingCount, icon: Clock, color: "text-fun-orange", link: "/moderator/queue" },
    { label: "Total Approved", value: approvedCount, icon: FileCheck, color: "text-fun-green", link: "/moderator/log" },
    { label: "Total Rejected", value: rejectedCount, icon: Shield, color: "text-fun-pink", link: "/moderator/log" },
  ];

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Moderator Dashboard 🔍</h1>
          <p className="text-muted-foreground">Review dan moderasi kursus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                <p className="font-heading text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg">Review Queue</h2>
              <p className="text-sm text-muted-foreground">
                {pendingCount > 0 ? `${pendingCount} kursus menunggu review` : "Tidak ada kursus pending"}
              </p>
            </div>
            <Link to="/moderator/queue">
              <Button>
                Buka Queue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorDashboard;
