import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const StudentBadges = () => {
  const { user } = useAuth();

  const { data: allBadges = [] } = useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data } = await supabase.from("badges").select("*");
      return data || [];
    },
  });

  const { data: earnedIds = [] } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("user_badges").select("badge_id").eq("user_id", user.id);
      return (data || []).map((ub) => ub.badge_id);
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout role="student">
      <h1 className="font-heading text-2xl font-bold mb-2">Koleksi Badges 🏅</h1>
      <p className="text-muted-foreground mb-8">Kumpulkan semua badges dengan menyelesaikan tantangan!</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {allBadges.map((badge) => {
          const earned = earnedIds.includes(badge.id);
          return (
            <Card key={badge.id} className={`p-6 text-center relative ${!earned ? "opacity-50" : ""}`}>
              {!earned && <Lock className="absolute top-3 right-3 w-4 h-4 text-muted-foreground" />}
              <p className="text-4xl mb-3">{badge.icon}</p>
              <h3 className="font-heading font-bold text-sm">{badge.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
              {earned && <span className="inline-block mt-3 text-[10px] font-bold text-fun-green bg-fun-green/10 px-2 py-0.5 rounded-full">Earned ✓</span>}
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default StudentBadges;
