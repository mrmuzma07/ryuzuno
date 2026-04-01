import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, xp_points, avatar_url")
        .order("xp_points", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const renderList = (users: any[]) => (
    <>
      {users.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[users[1], users[0], users[2]].map((user, i) => {
            const heights = ["h-28", "h-36", "h-24"];
            const medals = ["🥈", "🥇", "🥉"];
            return (
              <div key={user.id} className="text-center flex-1 max-w-[140px]">
                <div className="w-14 h-14 mx-auto rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg mb-2">
                  {(user.full_name || "U").charAt(0)}
                </div>
                <p className="font-semibold text-sm truncate">{user.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">{(user.xp_points || 0).toLocaleString()} pts</p>
                <div className={`${heights[i]} gradient-primary rounded-t-2xl mt-3 flex items-start justify-center pt-3`}>
                  <span className="text-2xl">{medals[i]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Card className="overflow-hidden">
        {users.map((user: any, i: number) => (
          <div key={user.id} className={`flex items-center gap-4 p-4 ${i < users.length - 1 ? "border-b" : ""}`}>
            <span className="font-heading font-bold text-lg w-8 text-center text-muted-foreground">
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
            </span>
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {(user.full_name || "U").charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{user.full_name || "User"}</p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-primary">{(user.xp_points || 0).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">points</p>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">Belum ada data leaderboard</div>
        )}
      </Card>
    </>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Leaderboard 🏆</h1>
          <p className="text-muted-foreground mt-2">Lihat siapa yang paling rajin belajar!</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="weekly">
            <TabsList className="w-full rounded-xl">
              <TabsTrigger value="weekly" className="flex-1 rounded-xl">Minggu Ini</TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1 rounded-xl">Bulan Ini</TabsTrigger>
              <TabsTrigger value="alltime" className="flex-1 rounded-xl">All Time</TabsTrigger>
            </TabsList>
            <TabsContent value="weekly" className="mt-6">{renderList(leaderboard)}</TabsContent>
            <TabsContent value="monthly" className="mt-6">{renderList(leaderboard)}</TabsContent>
            <TabsContent value="alltime" className="mt-6">{renderList(leaderboard)}</TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
