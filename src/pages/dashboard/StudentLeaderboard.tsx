import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Star } from "lucide-react";

const StudentLeaderboard = () => {
  const { user } = useAuth();

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["dashboard-leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, xp_points, avatar_url")
        .order("xp_points", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const myRank = leaderboard.findIndex((u: any) => u.id === user?.id) + 1;
  const myProfile = leaderboard.find((u: any) => u.id === user?.id);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Leaderboard 🏆</h1>
          <p className="text-muted-foreground text-sm mt-1">Lihat peringkatmu di antara pelajar lain</p>
        </div>

        {/* My rank card */}
        {myProfile && (
          <Card className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {(myProfile.full_name || "U").charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold">{myProfile.full_name || "Kamu"}</p>
                <p className="text-sm text-muted-foreground">Peringkat #{myRank}</p>
              </div>
              <div className="text-right">
                <p className="font-heading text-2xl font-bold text-primary">{(myProfile.xp_points || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP Points</p>
              </div>
            </div>
          </Card>
        )}

        {/* Top 3 podium */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((u: any, i: number) => {
              const heights = ["h-24", "h-32", "h-20"];
              const medals = ["🥈", "🥇", "🥉"];
              const isMe = u.id === user?.id;
              return (
                <div key={u.id} className="text-center flex-1 max-w-[130px]">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-sm mb-1 ${isMe ? "gradient-primary text-primary-foreground ring-2 ring-primary" : "bg-muted text-muted-foreground"}`}>
                    {(u.full_name || "U").charAt(0)}
                  </div>
                  <p className={`font-semibold text-xs truncate ${isMe ? "text-primary" : ""}`}>{u.full_name || "User"}</p>
                  <p className="text-[10px] text-muted-foreground">{(u.xp_points || 0).toLocaleString()} pts</p>
                  <div className={`${heights[i]} gradient-primary rounded-t-xl mt-2 flex items-start justify-center pt-2`}>
                    <span className="text-xl">{medals[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <Card className="overflow-hidden rounded-2xl">
          {leaderboard.map((u: any, i: number) => {
            const isMe = u.id === user?.id;
            return (
              <div key={u.id} className={`flex items-center gap-3 p-3.5 ${i < leaderboard.length - 1 ? "border-b" : ""} ${isMe ? "bg-primary/5" : ""}`}>
                <span className="font-heading font-bold text-sm w-8 text-center text-muted-foreground">
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                </span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${isMe ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {(u.full_name || "U").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${isMe ? "text-primary" : ""}`}>
                    {u.full_name || "User"} {isMe && <span className="text-xs font-normal">(Kamu)</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-sm text-primary">{(u.xp_points || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
              </div>
            );
          })}
          {leaderboard.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">Belum ada data leaderboard</div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentLeaderboard;
